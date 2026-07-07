create table position_attributes(
    position_id   int not null references positions(id) on delete cascade,
    attribute_id  int not null references attributes(id) on delete cascade,
    primary key (position_id, attribute_id)
);
