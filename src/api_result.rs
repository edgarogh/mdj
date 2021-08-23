use diesel::result::Error as DieselError;
use rocket::response::Responder;
use rocket::serde::json::Json;
use rocket::serde::Serializer;
use rocket::Request;
use serde::Serialize;

#[derive(serde::Serialize)]
pub struct Success {
    success: bool,
}

impl Default for Success {
    fn default() -> Self {
        Self { success: true }
    }
}

pub enum ApiResult<T = Success> {
    Ok(T),
    DatabaseError(DieselError),
}

impl ApiResult {
    pub fn success() -> Self {
        Self::Ok(Success::default())
    }
}

impl<T> From<DieselError> for ApiResult<T> {
    fn from(err: DieselError) -> Self {
        Self::DatabaseError(err)
    }
}

impl<T: Serialize> Serialize for ApiResult<T> {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        #[derive(serde::Serialize)]
        struct Error<E> {
            error: E,
        }

        match self {
            ApiResult::Ok(t) => t.serialize(serializer),
            ApiResult::DatabaseError(e) => Error {
                error: e.to_string(),
            }
            .serialize(serializer),
        }
    }
}

impl<'r, T: Serialize> Responder<'r, 'static> for ApiResult<T> {
    fn respond_to(self, request: &'r Request<'_>) -> rocket::response::Result<'static> {
        Json(self).respond_to(request)
    }
}
