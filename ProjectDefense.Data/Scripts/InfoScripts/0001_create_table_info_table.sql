create schema info;

create table info.info_table(
	id		smallserial primary key,
	code	smallint unique not null check(code > 0),
	name	varchar(50) not null,

	created_user_id     uuid references users(id),
    created_date_time   timestamptz not null default now(),
	modified_user_id    uuid null references users(id) on delete set null,
    modified_date_time  timestamptz null
);

