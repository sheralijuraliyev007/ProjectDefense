create table info.info_attribute_category(
    id      smallserial primary key,
    code    smallint not null unique check (code > 0),
    name    varchar(50) not null,

    created_user_id     uuid references users(id),
    created_date_time   timestamptz not null default now(),
	modified_user_id    uuid null references users(id) on delete set null,
    modified_date_time  timestamptz null
);


insert into info.info_attribute_category(code, name) 
values
(1, 'Certification'),
(2, 'Domain Knowledge'),
(3, 'Personal Information'),
(4, 'Soft Skills');
