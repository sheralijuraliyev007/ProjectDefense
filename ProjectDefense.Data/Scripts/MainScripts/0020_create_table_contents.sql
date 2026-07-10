create table contents(
    id                 bigserial primary key,
    public_id          varchar(255) not null unique,
    secure_url         varchar(500) not null,
    original_filename  varchar(255) not null,
    content_type_code  smallint not null references info.info_content_type(code),
    status_code        smallint not null references info.info_content_status(code) default 1,
    width              int not null,
    height             int not null,
    size_bytes         bigint not null check (size_bytes > 0),
    
    created_user_id     uuid references users(id),
    created_date_time   timestamptz not null default now(),
	modified_user_id    uuid null,
    modified_date_time  timestamptz null
    
);
create index ix_contents_uploaded_by on contents(uploaded_by);