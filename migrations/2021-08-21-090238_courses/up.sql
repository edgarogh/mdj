create table courses (
    id uuid not null default uuid_generate_v4(),
    owner uuid not null references accounts(id) on delete cascade,

    name varchar not null,
    description varchar,
    j_0 date not null,
    j_end date not null,
    recurrence varchar not null,

    cache_key uuid unique not null default uuid_generate_v4(),

    primary key (id)
);

create table events (
    owner uuid not null references accounts(id),
    course uuid not null references courses(id) on delete cascade,
    j bigint not null,

    marking varchar default null,
    date date not null,

    cache_key uuid references courses(cache_key) on update set null,

    primary key (course, j)
);

create index on events(date);

create function events_gc() returns trigger language plpgsql as
    $$ begin delete from events where cache_key is null; return null; end; $$;

create trigger events_gc_trigger
    after update of cache_key on events
    execute procedure events_gc();
