create table info.info_rule(
	id      smallserial primary key,
	code    smallint not null unique check (code > 0),
	name    varchar(50) not null,

	created_user_id     uuid not null,
    created_date_time   timestamptz not null default now(),
	modified_user_id    uuid null,
    modified_date_time  timestamptz null
);


insert into info.info_rule_operator(code, name) values
(1,'Greater than'),
(2,'Less than'),
(3,'Greater than or equal to'),
(4,'Less than or equal to'),
(5,'Equal to'),
(6,'Not equal to'),
(7,'Is true'),
(8,'Is false');