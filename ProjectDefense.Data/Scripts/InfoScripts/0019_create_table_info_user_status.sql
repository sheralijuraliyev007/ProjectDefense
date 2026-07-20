create table info.info_user_status(
	id      smallserial primary key,
	code    smallint not null unique check (code > 0),
	name    varchar(50) not null,

	created_user_id     uuid ,
    created_date_time   timestamptz not null default now(),
	modified_user_id    uuid,
    modified_date_time  timestamptz null
);


insert into info.info_user_status(code, name) values
(1, 'Active'),
(2, 'Blocked');