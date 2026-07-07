create table projects(
    id            serial primary key,
    user_id       uuid not null references users(id) on delete cascade,
    name          varchar(200) not null,
    period_start  date,
    period_end    date,
    description   text,          
    version       int not null default 1,

    created_user_id     uuid not null,
    created_date_time   timestamptz not null default now(),
	modified_user_id    uuid null,
    modified_date_time  timestamptz null
    
);
create index ix_projects_user_id on projects(user_id);