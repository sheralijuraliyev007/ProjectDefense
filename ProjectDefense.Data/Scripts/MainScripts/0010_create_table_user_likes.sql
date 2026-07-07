create table user_likes(
	id			bigserial primary key,
	user_id		uuid not null references users(id) on delete cascade,
	cv_id		bigint not null references cv(id) on delete cascade,
);

create index idx_user_likes_user_id on user_likes(user_id);
