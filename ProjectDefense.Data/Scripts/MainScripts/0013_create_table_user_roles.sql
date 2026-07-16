create table user_roles(
    user_id  uuid not null references users(id) on delete cascade,
    role_code  smallint not null references info.info_role(code),
    primary key (user_id, role_code),

    created_user_id     uuid references users(id),
    created_date_time   timestamptz not null default now(),
	modified_user_id    uuid null references users(id) on delete set null,
    modified_date_time  timestamptz null
);