create table discussion_messages(
	id				bigserial primary key,
	response_to_id  bigint null references discussion_messages(id),
	position_id		int not null references positions(id) on delete cascade,
	user_id			uuid not null references users(id),
	message			text not null
);

create index ix_discussion_messages_position_id on discussion_messages(position_id);