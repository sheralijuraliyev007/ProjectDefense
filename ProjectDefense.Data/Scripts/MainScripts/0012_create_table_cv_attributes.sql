create table cv_attributes(
    id                  serial primary key,
    cv_id               bigint not null references cv(id) on delete cascade,
    attribute_id        int not null references attributes(id) on delete cascade,
    value_generic       text,           
    value_numeric       numeric,
    value_date          date,
    value_period_start  date,
    value_period_end    date,
    value_boolean       boolean,
    value_option_id     int references attribute_options(id),
    value_content_id    bigint references contents(id),
    

    created_user_id     uuid references users(id),
    created_date_time   timestamptz not null default now(),
	modified_user_id    uuid null references users(id) on delete set null,
    modified_date_time  timestamptz null
);

create index ix_cv_attributes_numeric on cv_attributes(attribute_id, value_numeric) where value_numeric is not null;
create index ix_cv_attributes_boolean on cv_attributes(attribute_id, value_boolean) where value_boolean is not null;
create index ix_cv_attributes_option  on cv_attributes(attribute_id, value_option_id) where value_option_id is not null;