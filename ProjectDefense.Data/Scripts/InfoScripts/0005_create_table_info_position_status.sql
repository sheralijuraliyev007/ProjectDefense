create table info.info_position_status(
    id      smallserial primary key,
    code    smallint not null unique check (code > 0),
    name    varchar(50) not null
);
create index idx_position_status_code on info.info_status(code);

insert into info.info_position_status(code, name) values
(1, 'Active'),
(2, 'Deleted');


