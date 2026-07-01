create table info.info_table(
	id		smallserial primary key,
	code	smallint unique not null check(code > 0),
	name	varchar(50) not null
);

create index ix_info_table_code on info.info_table(code);