create table tags(
    id     serial primary key,
    label  varchar(50) not null unique
);
create index ix_tags_label_prefix on tags(label varchar_pattern_ops);  