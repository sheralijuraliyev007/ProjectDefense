create table cv_projects(
	cv_id       bigint not null references cv(id) on delete cascade,
	project_id  int not null references projects(id) on delete cascade,
	unique(cv_id, project_id)
);