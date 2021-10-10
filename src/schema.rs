table! {
    accounts (id) {
        id -> Uuid,
        email -> Varchar,
        password -> Nullable<Varchar>,
    }
}

table! {
    courses (id) {
        id -> Uuid,
        owner -> Uuid,
        name -> Varchar,
        description -> Nullable<Varchar>,
        j_0 -> Date,
        j_end -> Date,
        recurrence -> Varchar,
        cache_key -> Uuid,
        archived -> Bool,
    }
}

table! {
    events (course, j) {
        owner -> Uuid,
        course -> Uuid,
        j -> Int8,
        marking -> Nullable<Varchar>,
        date -> Date,
        cache_key -> Nullable<Uuid>,
    }
}

table! {
    sessions (token) {
        token -> Varchar,
        account -> Uuid,
        expires -> Timestamp,
    }
}

joinable!(courses -> accounts (owner));
joinable!(events -> accounts (owner));
joinable!(sessions -> accounts (account));

allow_tables_to_appear_in_same_query!(
    accounts,
    courses,
    events,
    sessions,
);
