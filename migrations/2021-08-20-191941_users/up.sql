create table accounts (
    id uuid not null default uuid_generate_v4(),

    email varchar(256) not null unique,
    password varchar(128),

    primary key (id)
);

create table sessions (
    token varchar(64),
    account uuid not null references accounts (id) on delete cascade,

    expires timestamp not null default now() + interval '6 months',

    primary key (token)
);

create function expiration_gc() returns void as $$
    begin
        delete from sessions where (expires < now());
    end;
$$ language plpgsql;
