create table attributes(
    id             serial primary key,
    name           varchar(50) not null unique,
    description    varchar(150) not null,
    dtype_code     smallint not null references info.info_attribute_type(code),
    category_code  smallint not null references info.info_attribute_category(code),
    is_removable   boolean not null default true,  
    version        int not null default 1,

    created_user_id     uuid references users(id),
    created_date_time   timestamptz not null default now(),
	modified_user_id    uuid null references users(id) on delete set null,
    modified_date_time  timestamptz null
);
create index ix_attributes_category_code on attributes(category_code);
create index ix_attributes_dtype_code on attributes(dtype_code);

insert into attributes (name, description, dtype_code, category_code, is_removable) values
('First Name', 'Candidate given name', 1, 3, false),
('Last Name',  'Candidate family name', 1, 3, false),
('Location',   'Candidate location', 1, 3, false),
('Personal Photo', 'Profile photo', 3, 3, false);