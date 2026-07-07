create schema info;

create table info.info_table(
	id		smallserial primary key,
	code	smallint unique not null check(code > 0),
	name	varchar(50) not null,

	created_user_id     uuid not null,
    created_date_time   timestamptz not null default now(),
	modified_user_id    uuid null,
    modified_date_time  timestamptz null
);

create index ix_info_table_code on info.info_table(code);