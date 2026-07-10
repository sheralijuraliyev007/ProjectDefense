create table position_project_tags(
    position_id int not null references positions(id) on delete cascade,
    tag_id      int not null references tags(id),
    primary key (position_id, tag_id),

    created_user_id     uuid references users(id),
    created_date_time   timestamptz not null default now(),
	modified_user_id    uuid null,
    modified_date_time  timestamptz null
);