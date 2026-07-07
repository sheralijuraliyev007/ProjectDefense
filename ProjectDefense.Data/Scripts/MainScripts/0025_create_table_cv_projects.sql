create table cv_projects(
	cv_id       bigint not null references cv(id) on delete cascade,
	project_id  int not null references projects(id) on delete cascade,
	created_user_id     uuid not null,
    created_date_time   timestamptz not null default now(),
	modified_user_id    uuid null,
    modified_date_time  timestamptz null,
	unique(cv_id, project_id)
);