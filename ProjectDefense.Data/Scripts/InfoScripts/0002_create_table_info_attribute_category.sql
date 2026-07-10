create table info.info_attribute_category(
    id      smallserial primary key,
    code    smallint not null unique check (code > 0),
    name    varchar(50) not null,

    created_user_id     uuid references users(id),
    created_date_time   timestamptz not null default now(),
	modified_user_id    uuid null,
    modified_date_time  timestamptz null
);

create index idx_attribute_category_code on info.info_attribute_category(code);

insert into info.info_table(code, name)
values(1, 'info_attribute_category');

insert into info.info_attribute_category(code, name) 
values
(1, 'Certification'),
(2, 'Domain Knowledge'),
(3, 'Personal Information'),
(4, 'Soft Skills');
