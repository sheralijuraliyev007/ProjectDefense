create table discussion_messages(
	id				bigserial primary key,
	response_to_id  bigint null references discussion_messages(id),
	position_id		int not null references positions(id) on delete cascade,
	user_id			uuid not null references users(id),
	message			text not null,
	created_user_id     uuid references users(id),
    created_date_time   timestamptz not null default now(),
	modified_user_id    uuid null references users(id) on delete set null,
    modified_date_time  timestamptz null
);

create index ix_discussion_messages_position_id on discussion_messages(position_id);