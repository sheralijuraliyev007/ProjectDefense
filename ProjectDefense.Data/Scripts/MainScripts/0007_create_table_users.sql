create table users(
    id                   uuid primary key ,
    email                varchar(255) not null unique,
    is_verified          boolean not null default false,
    status_code          smallint not null references info.info_user_status(code) default 1,
    version              int not null default 1
);


create index ix_users_status on users(status_code);