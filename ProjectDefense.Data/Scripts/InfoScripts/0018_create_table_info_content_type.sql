create table info.info_content_type(
	id      smallserial primary key,
	code    smallint not null unique check (code > 0),
	type_name varchar(100) not null unique,
	name    varchar(50) not null
);

insert into info.info_content_type(code, type_name, name) values
(1, 'image/jpeg', 'JPEG Image'),
(2, 'image/png',  'PNG Image'),
(3, 'image/webp', 'WebP Image'),
(4,'application/pdf','PDF Document'),
(5,'text/csv','CSV Document');
