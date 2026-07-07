create table info.info_cv_status(
    id      smallserial primary key,
    code    smallint not null unique check (code > 0),
    name    varchar(50) not null
);

create index ix_cv_status_code on info.info_cv_status(code);

insert into info.info_cv_status(code, name) 
values
(1, 'Draft'),
(2, 'Published'),
(3, 'Hidden');
