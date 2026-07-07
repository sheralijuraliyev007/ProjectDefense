create table projects(
    id            serial primary key,
    user_id       uuid not null references users(id) on delete cascade,
    name          varchar(200) not null,
    period_start  date,
    period_end    date,
    description   text,          
    version       int not null default 1,
    
);
create index ix_projects_user_id on projects(user_id);