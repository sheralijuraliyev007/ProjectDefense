create table attribute_options(
    id            serial primary key,
    attribute_id  int not null references attributes(id) on delete cascade,
    label         varchar(100) not null,
    sort_order    int not null default 0,
    unique (attribute_id, label),

    constraint uq_attribute_options_attribute_id_label unique (attribute_id, label)
);
