create table info.info_attribute_type(
	id			smallserial primary key,
	code		smallint not null unique check(code >0),
	name		varchar(50) not null
);

create index idx_attribute_type_code on info.info_attribute_type(code);
