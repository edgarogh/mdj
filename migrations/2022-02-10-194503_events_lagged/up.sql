create view timeline as select * from (
    select
        events.course as course,
        courses.owner as course_owner,
        courses.name as course_name,
        courses.description as course_description,
        events.j,
        lag(events.j) over (partition by events.course order by date, j) as previous_j,
        events.marking,
        lag(events.marking) over (partition by events.course order by date, j) as previous_marking,
        events.date,
        events.cache_key
    from events
    inner join courses on events.course = courses.id
    where not archived
    order by date, j
) _;
