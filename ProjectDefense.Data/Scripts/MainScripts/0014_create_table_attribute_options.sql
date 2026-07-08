create table attribute_options(
    id            serial primary key,
    attribute_id  int not null references attributes(id) on delete cascade,
    label         varchar(100) not null,
    sort_order    smallint not null default 0,
    unique (attribute_id, label),

    created_user_id     uuid not null,
    created_date_time   timestamptz not null default now(),
	modified_user_id    uuid null,
    modified_date_time  timestamptz null,

    constraint uq_attribute_options_attribute_id_label unique (attribute_id, label)
);
