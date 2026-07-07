create table project_tags(
    project_id  int not null references projects(id) on delete cascade,
    tag_id      int not null references tags(id),
    primary key (project_id, tag_id),

    created_user_id     uuid not null,
    created_date_time   timestamptz not null default now(),
	modified_user_id    uuid null,
    modified_date_time  timestamptz null
);
