create table users(
    id                              uuid primary key ,
    email                           varchar(255) not null unique,
    is_verified                     boolean not null default false,
    status_code                     smallint not null references info.info_user_status(code) default 1,
    password                        varchar(255) null,

    version                         int not null default 1,
    created_user_id                 uuid references users(id),
    created_date_time               timestamptz not null default now(),
	modified_user_id                uuid null,
    modified_date_time              timestamptz null
);


create index ix_users_status on users(status_code);

