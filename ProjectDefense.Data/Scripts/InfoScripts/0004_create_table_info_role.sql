create schema info;

create table info.info_role(
	id		smallserial primary key ,
	code	smallint unique check(code > 0) not null,
	name	varchar(50) not null unique
);


create index ix_info_role_code on info.info_role(code);

insert into info.info_role(code, name)
values
(1,'Candidate'),
(2,'Recruiter'),
(3,'Administrators');