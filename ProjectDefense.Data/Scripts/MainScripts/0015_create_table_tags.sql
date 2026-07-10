create table tags(
    id     serial primary key,
    label  varchar(50) not null unique,
    created_user_id     uuid references users(id),
    created_date_time   timestamptz not null default now(),
	modified_user_id    uuid null,
    modified_date_time  timestamptz null
);
create index ix_tags_label_prefix on tags(label varchar_pattern_ops);  