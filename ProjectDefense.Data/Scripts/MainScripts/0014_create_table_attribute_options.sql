create table attribute_options(
    id            serial primary key,
    attribute_id  int not null references attributes(id) on delete cascade,
    label         varchar(100) not null,
    sort_order    smallint not null default 0,
    unique (attribute_id, label),
    unique(attribute_id, id),

    created_user_id     uuid references users(id),
    created_date_time   timestamptz not null default now(),
	modified_user_id    uuid null references users(id) on delete set null,
    modified_date_time  timestamptz null
);
