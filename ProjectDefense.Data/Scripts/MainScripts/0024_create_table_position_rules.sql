create table position_rules(
    id               serial primary key,
    position_id      int not null references positions(id) on delete cascade,
    attribute_id     int not null references attributes(id) on delete cascade,
    rule_code    smallint not null references info.info_rule(code),

    value_numeric    numeric,
    value_date       date,
    value_boolean    boolean,
    value_option_id  int,

    created_user_id     uuid not null,
    created_date_time   timestamptz not null default now(),
	modified_user_id    uuid null,
    modified_date_time  timestamptz null,

    constraint fk_access_rules_option
        foreign key (value_option_id, attribute_id)
        references attribute_options(id, attribute_id)
);

create index ix_access_rules_position on position_access_rules(position_id);
create index ix_access_rules_attribute on position_access_rules(attribute_id);