create table position_rules(
    id               serial primary key,
    position_id      int not null references positions(id) on delete cascade,
    attribute_id     int not null references attributes(id) on delete cascade,
    rule_code    smallint not null references info.info_rule(code),

    value_numeric    numeric,
    value_date       date,
    value_boolean    boolean,
    value_option_id  int,

    constraint fk_access_rules_option
        foreign key (value_option_id, attribute_id)
        references attribute_options(id, attribute_id)
);

create index ix_access_rules_position on position_access_rules(position_id);
create index ix_access_rules_attribute on position_access_rules(attribute_id);