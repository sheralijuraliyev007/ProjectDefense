create table position_attributes(
    position_id   int not null references positions(id) on delete cascade,
    attribute_id  int not null references attributes(id) on delete cascade,
    primary key (position_id, attribute_id),

    created_user_id     uuid not null,
    created_date_time   timestamptz not null default now(),
	modified_user_id    uuid null,
    modified_date_time  timestamptz null
);
