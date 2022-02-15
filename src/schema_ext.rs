table! {
    timeline (course, j) {
        course -> Uuid,
        course_owner -> Uuid,
        course_name -> Varchar,
        course_description -> Nullable<Varchar>,
        j -> Int8,
        previous_j -> Nullable<Int8>,
        marking -> Nullable<Varchar>,
        previous_marking -> Nullable<Varchar>,
        date -> Date,
        cache_key -> Nullable<Uuid>,
    }
}
