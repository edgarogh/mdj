use crate::schema::events as events_table;
use chrono::{Duration, NaiveDate};
use std::num::ParseIntError;
use uuid::Uuid;

diesel::joinable!(crate::schema::events -> crate::schema::courses (course));

#[derive(Insertable)]
#[table_name = "events_table"]
pub struct NewEvent {
    owner: Uuid,
    course: Uuid,
    j: i64,
    marking: Option<String>,
    date: NaiveDate,
    cache_key: Uuid,
}

#[derive(Debug)]
enum ParseRecurrenceError {
    ParseInt(ParseIntError),
    NotAscending,
}

impl NewEvent {
    pub fn parse_recurrence(str: &str) -> Vec<u32> {
        let mut max = -1i64;

        str.split(',')
            .map(|n| {
                n.parse::<u32>()
                    .map_err(ParseRecurrenceError::ParseInt)
                    .and_then(|n| {
                        if n as i64 > max {
                            max = n as i64;
                            Ok(n)
                        } else {
                            Err(ParseRecurrenceError::NotAscending)
                        }
                    })
            })
            .collect::<Result<Vec<_>, _>>()
            .unwrap_or_else(|_| vec![0])
    }

    pub fn from_offsets(
        offsets: &[u32],
        owner: Uuid,
        course: Uuid,
        j_0: NaiveDate,
        j_end: NaiveDate,
        cache_key: Uuid,
    ) -> Vec<Self> {
        offsets
            .into_iter()
            .map(|&o| (j_0 + Duration::days(o as _), o as i64))
            .take_while(|(date, _)| date <= &j_end)
            .map(|(date, j)| NewEvent {
                owner,
                course,
                j,
                marking: None,
                date,
                cache_key,
            })
            .collect()
    }
}
