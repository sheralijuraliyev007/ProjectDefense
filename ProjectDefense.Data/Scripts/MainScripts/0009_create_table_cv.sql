create table cv(
    id            bigserial primary key,
    position_id   int not null references positions(id),
    user_id       uuid not null references users(id) on delete cascade,
    status_code   smallint not null references info.info_cv_status(code) default 1,
    version       int not null default 1,
    unique (position_id, user_id)   
);
create index ix_cv_user_id on cv(user_id);
create index ix_cv_position_id on cv(position_id);
create index ix_cv_status on cv(status_code);