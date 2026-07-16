create table user_likes(
	user_id		uuid not null references users(id) on delete cascade,
	cv_id		bigint not null references cv(id) on delete cascade,

	created_user_id     uuid references users(id),
    created_date_time   timestamptz not null default now(),
	modified_user_id    uuid null references users(id) on delete set null,
    modified_date_time  timestamptz null,
	primary key (user_id, cv_id)
);

create index idx_user_likes_user_id on user_likes(user_id);
