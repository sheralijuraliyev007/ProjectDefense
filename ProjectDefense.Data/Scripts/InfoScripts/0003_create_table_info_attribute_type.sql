create table info.info_attribute_type(
    id      smallserial primary key,
    code    smallint not null unique check (code > 0),
    name    varchar(50) not null,

    created_user_id     uuid not null,
    created_date_time   timestamptz not null default now(),
	modified_user_id    uuid null,
    modified_date_time  timestamptz null
);


create index idx_attribute_type_code on info.info_attribute_type(code);

insert into info.info_table(code, name)
values(2,'info_attribute_type')


insert into info.info_attribute_type(code, name) values
(1, 'String'),
(2, 'Text'),
(3, 'Image'),
(4, 'Numeric'),
(5, 'Date'),
(6, 'Period'),
(7, 'Boolean'),
(8, 'One of many');

