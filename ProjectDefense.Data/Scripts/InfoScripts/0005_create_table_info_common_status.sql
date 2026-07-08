create table info.info_common_status(
    id      smallserial primary key,
    code    smallint not null unique check (code > 0),
    name    varchar(50) not null,

    created_user_id     uuid not null,
    created_date_time   timestamptz not null default now(),
	modified_user_id    uuid null,
    modified_date_time  timestamptz null
);
create index idx_common_status_code on info.info_common_status(code);

insert into info.info_common_status(code, name) values
(1, 'Active'),
(2, 'Deleted');


