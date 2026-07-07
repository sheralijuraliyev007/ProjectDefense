create table position_project_tags(
    position_id int not null references positions(id) on delete cascade,
    tag_id      int not null references tags(id),
    primary key (position_id, tag_id)
);