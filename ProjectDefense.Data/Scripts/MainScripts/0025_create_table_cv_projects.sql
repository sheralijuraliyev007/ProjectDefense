create table cv_projects(
	cv_id       bigint not null references cv(id) on delete cascade,
    project_id  int not null references projects(id) on delete cascade,
    primary key (cv_id, project_id),



	created_user_id     uuid references users(id),
    created_date_time   timestamptz not null default now(),
	modified_user_id    uuid null references users(id) on delete set null,
    modified_date_time  timestamptz null,
	
);
