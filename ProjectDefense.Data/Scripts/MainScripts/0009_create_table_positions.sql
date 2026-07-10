create table positions(
    id                serial primary key,
    title             varchar(200) not null,
    short_description varchar(500) not null,
    is_public         boolean not null default true,  
    max_projects      smallint not null default 5 check (max_projects > 0),
    status_code         smallint not null references info.info_common_status(code) default 1,
    version           int not null default 1,

    created_user_id     uuid references users(id),
    created_date_time   timestamptz not null default now(),
	modified_user_id    uuid null,
    modified_date_time  timestamptz null
);
create index ix_positions_status on positions(status_code);