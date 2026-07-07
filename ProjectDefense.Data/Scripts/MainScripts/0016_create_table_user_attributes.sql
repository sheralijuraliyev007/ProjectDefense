create table user_attributes(
    user_id             uuid not null references users(id) on delete cascade,
    attribute_id        int not null references attributes(id) on delete cascade,
    value_generic       text,           
    value_numeric       numeric,
    value_date          date,
    value_period_start  date,
    value_period_end    date,
    value_boolean       boolean,
    value_option_id     int references attribute_options(id),
    value_content_id    bigint references contents(id),   
    version             int not null default 1,
    updated_at          timestamp not null default now(),
    primary key (user_id, attribute_id)
);
create index ix_user_attributes_numeric on user_attributes(attribute_id, value_numeric) where value_numeric is not null;
create index ix_user_attributes_boolean on user_attributes(attribute_id, value_boolean) where value_boolean is not null;
create index ix_user_attributes_option  on user_attributes(attribute_id, value_option_id) where value_option_id is not null;
