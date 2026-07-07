create table info.info_user_status(
	id      smallserial primary key,
	code    smallint not null unique check (code > 0),
	name    varchar(50) not null
);

create index ix_info_user_status_code on info.info_user_status(code);

insert into info.info_user_status(code, name) values
(1, 'Active'),
(2, 'Blocked');