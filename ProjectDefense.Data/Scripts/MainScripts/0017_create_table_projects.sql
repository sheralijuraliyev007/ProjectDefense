create table projects(
    id            serial primary key,
    user_id       uuid not null references users(id) on delete cascade,
    name          varchar(200) not null,
    period_start  date,
    period_end    date,
    description   varchar(2500) not null,          
    version       int not null default 1,

    created_user_id     uuid not null,
    created_date_time   timestamptz not null default now(),
	modified_user_id    uuid null,
    modified_date_time  timestamptz null
    constraint chk_projects_period check (period_end is null or period_start is null or period_end >= period_start)
    
);
create index ix_projects_user_id on projects(user_id);