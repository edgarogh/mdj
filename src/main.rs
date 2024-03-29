#[macro_use]
extern crate diesel;
#[macro_use]
extern crate diesel_migrations;
#[macro_use]
extern crate rocket;

mod api_result;
mod asset;
mod model;
mod schema;
mod schema_ext;

use crate::api_result::ApiResult;
use crate::asset::{Asset, AssetName};
use crate::model::NewEvent;
use chrono::{LocalResult, NaiveDate, TimeZone, Utc};
use diesel::prelude::*;
use diesel_migrations::{EmbeddedMigrations, MigrationHarness};
use icalendar::{Calendar, Component};
use rand::Rng;
use rocket::fairing::AdHoc;
use rocket::form::{Form, FromForm};
use rocket::http::{ContentType, Cookie, CookieJar, SameSite, Status};
use rocket::outcome::try_outcome;
use rocket::outcome::IntoOutcome;
use rocket::request::{FromRequest, Outcome};
use rocket::response::Redirect;
use rocket::serde::json::Json;
use rocket::{Request, Rocket};
use schema::accounts as accounts_table;
use std::path::PathBuf;
use uuid::Uuid;

pub const MIGRATIONS: EmbeddedMigrations = embed_migrations!();

const DATE_FORMAT: &str = "%Y-%m-%d";

#[rocket_sync_db_pools::database("mdj")]
struct DbConn(rocket_sync_db_pools::diesel::PgConnection);

#[rocket::launch]
async fn launch() -> _ {
    Rocket::build()
        .mount(
            "/",
            routes![
                index,
                assets,
                login,
                logout,
                account_info,
                courses,
                courses_insert,
                courses_update,
                courses_update_recurrence,
                courses_archive,
                courses_delete,
                timeline,
                mark,
                ical,
            ],
        )
        .attach(DbConn::fairing())
        .attach(AdHoc::on_liftoff("migration runner", |rocket| {
            Box::pin(async move {
                let conn = DbConn::get_one(rocket)
                    .await
                    .expect("no database available for running migrations");

                conn.run(|c| c.run_pending_migrations(MIGRATIONS).map(|vec| vec.len()))
                    .await
                    .unwrap();
            })
        }))
}

macro_rules! with_db {
    ($db:ident => $b:block ?) => {
        match with_db!($db => $b) {
            Ok(t) => t,
            Err(err) => return ApiResult::from(err),
        }
    };
    ($db:ident => || $b:block ?) => {
        match with_db!($db => $b) {
            Ok(t) => t,
            Err(err) => return ApiResult::from(err),
        }
    };
    ($db:ident => $b:block) => {
        $db.run(move |$db| $b).await
    };
    ($db:ident => || $b:block) => {
        $db.run(move |$db| $db.transaction::<_, diesel::result::Error, _>(|| $b))
            .await
    };
}

#[get("/<_anything..>", rank = 10)]
async fn index(_anything: PathBuf) -> Asset {
    Asset::open(AssetName::index_html()).await.unwrap()
}

#[get("/<asset>")]
pub async fn assets(asset: AssetName) -> Option<Asset> {
    Asset::open(asset).await
}

#[derive(FromForm)]
struct LoginForm {
    email: String,
    password: String,
}

const COOKIE_SESSION_NAME: &str = "mdj:session";

#[derive(Debug, Identifiable, Queryable)]
#[diesel(table_name = accounts_table)]
struct Account {
    id: Uuid,
    email: String,
    password: Option<String>,
}

#[derive(Debug)]
enum AccountAuthError {
    NoCookie,
    NoDatabase,
    AccountOrSessionNotFound,
}

#[rocket::async_trait]
impl<'r> FromRequest<'r> for Account {
    type Error = AccountAuthError;

    async fn from_request(request: &'r Request<'_>) -> Outcome<Self, Self::Error> {
        let cookies = request.cookies();
        let cookie = match cookies
            .get_private(COOKIE_SESSION_NAME)
            .ok_or((Status::Unauthorized, AccountAuthError::NoCookie))
        {
            Ok(cookie) => cookie,
            Err(err) => return Outcome::Failure(err),
        };

        let db = try_outcome!(request
            .guard::<DbConn>()
            .await
            .map_failure(|(status, _)| (status, AccountAuthError::NoDatabase)));

        let session_token = cookie.value().to_string();

        let account = with_db!(db => {
            use schema::accounts::dsl;

            dsl::accounts.select((dsl::id, dsl::email, dsl::password))
                .inner_join(schema::sessions::dsl::sessions)
                .filter(schema::sessions::dsl::token.eq(session_token))
                .first::<Account>(db)
        })
        .map_err(|_| AccountAuthError::AccountOrSessionNotFound)
        .into_outcome(Status::Unauthorized);

        Outcome::Success(try_outcome!(account))
    }
}

#[post("/login", data = "<form>")]
async fn login(
    db: DbConn,
    form: Form<LoginForm>,
    cookies: &CookieJar<'_>,
) -> Result<Redirect, (Status, rocket::response::content::RawJson<&'static str>)> {
    use rocket::response::content::RawJson as ContentJson;

    let form = form.into_inner();
    let email = form.email;

    let account = with_db!(db => {
        use schema::accounts::dsl;

        dsl::accounts
            .filter(dsl::email.eq(email))
            .first::<Account>(db)
    })
    .map_err(|_| {
        (
            Status::InternalServerError,
            ContentJson(r#"{"error_kind":"database"}"#),
        )
    })?;

    if bcrypt::verify(&form.password, &account.password.unwrap_or_default()).unwrap_or_default() {
        let account_id = account.id;

        let session = with_db!(db => {
            use schema::sessions::dsl;

            use schema::sessions as sessions_table;
            #[derive(Insertable)]
            #[diesel(table_name = sessions_table)]
            struct Session<'a> {
                token: &'a str,
                account: Uuid,
            }

            let token: String = rand::thread_rng()
                .sample_iter(&rand::distributions::Alphanumeric)
                .take(64)
                .map(char::from)
                .collect();

            diesel::insert_into(dsl::sessions)
                .values(Session {token: &token, account: account_id})
                .execute(db)
                .map(|_| token)
        });

        match session {
            Ok(session) => {
                cookies.add_private(
                    Cookie::build(COOKIE_SESSION_NAME, session)
                        .same_site(SameSite::Strict)
                        .finish(),
                );
                Ok(Redirect::to("/"))
            }
            Err(_) => Err((
                Status::InternalServerError,
                ContentJson(r#"{"error_kind":"database"}"#),
            )),
        }
    } else {
        Err((
            Status::Unauthorized,
            ContentJson(r#"{"error_kind":"invalid_credentials"}"#),
        ))
    }
}

#[get("/logout")]
fn logout(cookies: &CookieJar) -> Redirect {
    cookies.remove_private(Cookie::named(COOKIE_SESSION_NAME));
    Redirect::to("/login")
}

#[derive(serde::Serialize)]
struct AccountInfo {
    id: Uuid,
    email: String,
    recurrences: [&'static [u32]; 1],
}

#[get("/api/account")]
fn account_info(a: Account) -> ApiResult<AccountInfo> {
    ApiResult::Ok(AccountInfo {
        id: a.id,
        email: a.email,
        recurrences: [&[0, 1, 3, 7, 14, 21, 30, 45, 60, 75, 90, 95, 110]],
    })
}

#[derive(Queryable, serde::Serialize)]
pub struct Course {
    id: Uuid,
    author: Uuid,
    name: String,
    description: Option<String>,
    j_0: NaiveDate,
    j_end: NaiveDate,
    recurrence: String,
    cache_key: Uuid,
    archived: bool,
}

#[derive(serde::Serialize)]
pub struct CourseAndOccurrences {
    id: Uuid,
    author: Uuid,
    name: String,
    description: Option<String>,
    j_0: NaiveDate,
    j_end: NaiveDate,
    recurrence: String,
    cache_key: Uuid,

    occurrences: Vec<(NaiveDate, i64, Option<String>)>,
}

impl From<(Course, Vec<(NaiveDate, i64, Option<String>)>)> for CourseAndOccurrences {
    fn from((c, occurrences): (Course, Vec<(NaiveDate, i64, Option<String>)>)) -> Self {
        Self {
            id: c.id,
            author: c.id,
            name: c.name,
            description: c.description,
            j_0: c.j_0,
            j_end: c.j_end,
            recurrence: c.recurrence,
            cache_key: c.cache_key,
            occurrences,
        }
    }
}

macro_rules! try_block_mut {
    { $($token:tt)* } => {{
        let mut l = || {
            $($token)*
        };
        l()
    }}
}

#[get("/api/courses?<archived>")]
async fn courses(
    db: DbConn,
    a: Account,
    archived: Option<bool>,
) -> ApiResult<Vec<CourseAndOccurrences>> {
    let archived = archived.unwrap_or(false);

    let courses = with_db!(db => {
        use schema::courses::dsl as c_dsl;
        use schema::events::dsl as e_dsl;

        try_block_mut! {
            let mut courses: Vec<CourseAndOccurrences> = c_dsl::courses
                .order_by(c_dsl::j_0.asc())
                .filter(c_dsl::owner.eq(a.id).and(c_dsl::archived.eq(archived)))
                .load::<Course>(db)?
                .into_iter()
                .map(|c| CourseAndOccurrences::from((c, Vec::new())))
                .collect::<Vec<_>>();

            for course in &mut courses {
                course.occurrences = e_dsl::events
                    .order_by(e_dsl::date.asc())
                    .filter(e_dsl::course.eq(course.id))
                    .select((e_dsl::date, e_dsl::j, e_dsl::marking))
                    .load::<(NaiveDate, i64, Option<String>)>(db)?;
            }

            Ok(courses) as Result<_, diesel::result::Error>
        }
    }?);

    ApiResult::Ok(courses)
}

#[derive(serde::Deserialize)]
struct CourseBody {
    name: String,
    description: String,
    j_0: NaiveDate,
    j_end: NaiveDate,
    recurrence: String,
}

#[post("/api/courses", data = "<json>")]
async fn courses_insert(
    db: DbConn,
    a: Account,
    json: Json<CourseBody>,
) -> ApiResult<CourseAndOccurrences> {
    let json = json.into_inner();

    let offsets = NewEvent::parse_recurrence(&json.recurrence);

    use schema::courses as courses_table;
    #[derive(Insertable)]
    #[diesel(table_name = courses_table)]
    struct NewCourse {
        owner: Uuid,
        name: String,
        description: Option<String>,
        j_0: NaiveDate,
        j_end: NaiveDate,
        recurrence: String,
    }

    let course = NewCourse {
        owner: a.id,
        name: json.name,
        description: Some(json.description).filter(|d| !d.is_empty()),
        j_0: json.j_0,
        j_end: json.j_end,
        recurrence: json.recurrence,
    };

    let course = with_db!(db => {
        use schema::courses::dsl as c_dsl;
        use schema::events::dsl as e_dsl;

        db.transaction::<_, diesel::result::Error, _>(|db| {
            let course = diesel::insert_into(c_dsl::courses).values(course).get_result::<Course>(db)?;
            let dates = NewEvent::from_offsets(
                &offsets, course.author, course.id, course.j_0, course.j_end, course.cache_key
            );
            let occurrences = dates.iter().zip(&offsets).map(|(date, o)| (date.date, *o as _, None)).collect();
            diesel::insert_into(e_dsl::events).values(dates).execute(db)?;
            Ok(CourseAndOccurrences::from((course, occurrences)))
        })
    }?);

    ApiResult::Ok(course)
}

#[derive(serde::Deserialize)]
struct CourseMod {
    name: Option<String>,
    description: Option<String>,
}

#[put("/api/courses/<id>", data = "<json>")]
async fn courses_update(db: DbConn, a: Account, id: Uuid, json: Json<CourseMod>) -> ApiResult {
    let json = json.into_inner();

    with_db!(db => || {
        use schema::courses::dsl as c_dsl;

        use schema::courses as courses_table;
        #[derive(AsChangeset)]
        #[diesel(table_name = courses_table)]
        struct CourseChangeset {
            name: Option<String>,
            description: Option<Option<String>>,
        }

        let changes = CourseChangeset {
            name: json.name,
            description: match json.description {
                Some(d) if d.is_empty() => Some(None),
                Some(d) => Some(Some(d)),
                None => None,
            },
        };

        diesel::update(c_dsl::courses)
            .set(changes)
            .filter(c_dsl::owner.eq(a.id).and(c_dsl::id.eq(id)))
            .execute(db)?;

        Result::<_, diesel::result::Error>::Ok(())
    }?);

    ApiResult::success()
}

#[derive(serde::Deserialize)]
struct UpdateRecurrence {
    recurrence: String,
    j_0: NaiveDate,
    j_end: NaiveDate,
}

#[post("/api/courses/<id>/recurrence", data = "<json>")]
async fn courses_update_recurrence(
    db: DbConn,
    a: Account,
    id: Uuid,
    json: Json<UpdateRecurrence>,
) -> ApiResult {
    let UpdateRecurrence {
        recurrence,
        j_0,
        j_end,
    } = json.into_inner();

    let offsets = NewEvent::parse_recurrence(&recurrence);

    with_db!(db => || {
        use schema::courses::dsl as c_dsl;
        use schema::events::dsl as e_dsl;

        let cache_key = Uuid::new_v4();

        let course = c_dsl::courses
            .filter(c_dsl::owner.eq(a.id).and(c_dsl::id.eq(id)))
            .first::<Course>(db)?;

        let events = NewEvent::from_offsets(&offsets, a.id, id, j_0, j_end, cache_key);

        diesel::update(c_dsl::courses)
            .filter(c_dsl::owner.eq(a.id).and(c_dsl::id.eq(id)))
            .set((
                c_dsl::recurrence.eq(recurrence),
                c_dsl::cache_key.eq(cache_key),
                c_dsl::j_0.eq(j_0),
                c_dsl::j_end.eq(j_end),
            ))
            .execute(db)?;

        diesel::insert_into(e_dsl::events)
            .values(events)
            .execute(db)
    }?);

    ApiResult::success()
}

#[put("/api/courses/<id>/archived", data = "<archived>")]
async fn courses_archive(db: DbConn, a: Account, id: Uuid, archived: Json<bool>) -> ApiResult {
    let archived = archived.into_inner();

    with_db!(db => {
        use schema::courses::dsl as c_dsl;

        use schema::courses as courses_table;
        #[derive(AsChangeset)]
        #[diesel(table_name = courses_table)]
        struct CourseChangeset {
            archived: bool,
        }

        diesel::update(c_dsl::courses)
            .set(CourseChangeset { archived })
            .filter(c_dsl::owner.eq(a.id).and(c_dsl::id.eq(id)))
            .execute(db)
    }?);

    ApiResult::success()
}

#[delete("/api/courses/<id>")]
async fn courses_delete(db: DbConn, a: Account, id: Uuid) -> ApiResult {
    with_db!(db => {
        use schema::courses::dsl;

        diesel::delete(dsl::courses)
            .filter(dsl::owner.eq(a.id).and(dsl::id.eq(id)))
            .execute(db)
    }?);

    ApiResult::success()
}

#[derive(Queryable, serde::Serialize)]
struct Event {
    owner: Uuid,
    course: Uuid,
    j: i64,
    marking: Option<String>,
    date: NaiveDate,
    cache_key: Option<Uuid>,
}

#[derive(Queryable, serde::Serialize)]
struct EventAndCourse {
    course: Uuid,
    course_owner: Uuid,
    course_name: String,
    course_description: Option<String>,

    j: i64,
    previous_j: Option<i64>,
    marking: Option<String>,
    previous_marking: Option<String>,
    date: NaiveDate,
    cache_key: Option<Uuid>,
}

#[get("/api/timeline?<after>")]
async fn timeline(db: DbConn, a: Account, after: Option<String>) -> ApiResult<Vec<EventAndCourse>> {
    let after = after
        .and_then(|date| NaiveDate::parse_from_str(&date, DATE_FORMAT).ok())
        .unwrap_or_else(|| Utc::today().naive_local());

    let events = with_db!(db => {
        use schema_ext::timeline::dsl;

        dsl::timeline
            .filter(dsl::course_owner.eq(a.id).and(dsl::date.ge(after)))
            .limit(50)
            .load::<EventAndCourse>(db)
    }?);

    ApiResult::Ok(events)
}

#[put("/api/courses/<course>/events/<j>/marking", data = "<marking>")]
async fn mark(db: DbConn, a: Account, course: Uuid, j: u32, marking: String) -> ApiResult {
    let marking = Some(marking).filter(|m| !m.is_empty());

    with_db!(db => {
        use schema::events::dsl;

        diesel::update(dsl::events)
            .filter(dsl::owner.eq(a.id).and(dsl::course.eq(course).and(dsl::j.eq(j as i64))))
            .set(dsl::marking.eq(marking))
            .execute(db)
    }?);

    ApiResult::success()
}

fn color_name_for_mark(mark: Option<&str>) -> (&'static str, &'static str) {
    match mark {
        Some("started") => ("yellow", "[Démarré]\n"),
        Some("further_learning_required") => ("#ffc000", "[À approfondir]\n"),
        Some("done") => ("#92d050", "[Terminé]\n"),
        _ => ("white", ""),
    }
}

// TODO secure
#[get("/ical/<account>")]
async fn ical(db: DbConn, account: Uuid) -> Result<(ContentType, String), (Status, String)> {
    let mut calendar = Calendar::new();

    let events: Vec<EventAndCourse> = with_db!(db => {
        use schema_ext::timeline::dsl;

        dsl::timeline
            .filter(dsl::course_owner.eq(account))
            .load::<EventAndCourse>(db)
    })
    .map_err(|e| (Status::ServiceUnavailable, format!("Database error: {}", e)))?;

    calendar.name("Calendrier Méthode des J");

    for event in events {
        let date = match Utc.from_local_date(&event.date) {
            LocalResult::Single(date) => date,
            other => {
                eprintln!("couldn't convert local date to utc: {:?}", other);
                continue;
            }
        };

        let (mark_color, mark_name) = color_name_for_mark(event.marking.as_deref());

        let mut cal_event_ = icalendar::Event::new();
        let cal_event = cal_event_
            .all_day(date.naive_utc())
            .summary(&format!("MdJ: {} #{}", event.course_name.as_str(), event.j))
            .add_property("COLOR", mark_color)
            .add_property("URL", "https://mdj.edgar.bzh/");

        if let Some(description) = event.course_description {
            cal_event.description(&format!("{}{}", mark_name, description));
        } else {
            cal_event.description(mark_name);
        }

        calendar.push(cal_event_);
    }

    Ok((ContentType::Calendar, calendar.to_string()))
}
