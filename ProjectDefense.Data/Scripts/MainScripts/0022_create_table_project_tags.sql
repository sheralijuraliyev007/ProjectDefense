create table project_tags(
    project_id  int not null references projects(id) on delete cascade,
    tag_id      int not null references tags(id),
    primary key (project_id, tag_id)
);
