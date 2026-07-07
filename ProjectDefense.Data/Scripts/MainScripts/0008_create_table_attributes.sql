create table attributes(
    id             serial primary key,
    name           varchar(50) not null unique,
    description    varchar(150) not null,
    dtype_code     smallint not null references info.info_attribute_dtype(code),
    category_code  smallint not null references info.info_attribute_category(code),
    is_removable   boolean not null default true,  
    version        int not null default 1,

    created_user_id     uuid not null,
    created_date_time   timestamptz not null default now(),
	modified_user_id    uuid null,
    modified_date_time  timestamptz null
);
create index ix_attributes_category_code on attributes(category_code);
create index ix_attributes_dtype_code on attributes(dtype_code);