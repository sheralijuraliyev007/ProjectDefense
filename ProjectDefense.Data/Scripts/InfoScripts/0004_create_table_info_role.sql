create table info.info_role(
    id      smallserial primary key,
    code    smallint unique not null check (code > 0),
    name    varchar(50) not null unique,

    created_user_id     uuid references users(id),
    created_date_time   timestamptz not null default now(),
	modified_user_id    uuid null,
    modified_date_time  timestamptz null
);

create index ix_info_role_code on info.info_role(code);

insert into info.info_table (code,name)
values (3,'info_role');


insert into info.info_role(code, name) values
(1, 'Candidate'),
(2, 'Recruiter'),
(3, 'Administrator');