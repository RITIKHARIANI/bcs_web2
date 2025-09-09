--
-- PostgreSQL database dump
--

\restrict JlfXNFgUsvhIskHJzTKIU3fybg6Ky89QCRVW4WfrWTUcF7Nm6eTLnpbg536GGD1

-- Dumped from database version 15.14 (Homebrew)
-- Dumped by pg_dump version 15.14 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: course_modules; Type: TABLE; Schema: public; Owner: ritikhariani
--

CREATE TABLE public.course_modules (
    id text NOT NULL,
    course_id text NOT NULL,
    module_id text NOT NULL,
    sort_order integer NOT NULL,
    custom_title text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.course_modules OWNER TO ritikhariani;

--
-- Name: courses; Type: TABLE; Schema: public; Owner: ritikhariani
--

CREATE TABLE public.courses (
    id text NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    description text,
    author_id text NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    featured boolean DEFAULT false NOT NULL,
    tags text[],
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.courses OWNER TO ritikhariani;

--
-- Name: media_files; Type: TABLE; Schema: public; Owner: ritikhariani
--

CREATE TABLE public.media_files (
    id text NOT NULL,
    filename text NOT NULL,
    original_name text NOT NULL,
    file_size bigint NOT NULL,
    mime_type text NOT NULL,
    storage_path text NOT NULL,
    thumbnail_path text,
    uploaded_by text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.media_files OWNER TO ritikhariani;

--
-- Name: module_media; Type: TABLE; Schema: public; Owner: ritikhariani
--

CREATE TABLE public.module_media (
    id text NOT NULL,
    module_id text NOT NULL,
    media_file_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.module_media OWNER TO ritikhariani;

--
-- Name: modules; Type: TABLE; Schema: public; Owner: ritikhariani
--

CREATE TABLE public.modules (
    id text NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    content text,
    description text,
    author_id text NOT NULL,
    parent_module_id text,
    sort_order integer DEFAULT 0 NOT NULL,
    module_number text,
    status text DEFAULT 'draft'::text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.modules OWNER TO ritikhariani;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: ritikhariani
--

CREATE TABLE public.sessions (
    id text NOT NULL,
    session_token text NOT NULL,
    user_id text NOT NULL,
    expires timestamp(3) without time zone NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.sessions OWNER TO ritikhariani;

--
-- Name: users; Type: TABLE; Schema: public; Owner: ritikhariani
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    name text NOT NULL,
    role text DEFAULT 'faculty'::text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO ritikhariani;

--
-- Data for Name: course_modules; Type: TABLE DATA; Schema: public; Owner: ritikhariani
--

COPY public.course_modules (id, course_id, module_id, sort_order, custom_title, created_at) FROM stdin;
cmewyyevw0004w367oku0ta27	cmewyyevr0003w367fqkef44b	cmes178u20003sii2leoksxok	0	\N	2025-08-29 15:09:52.988
cmewyyevw0005w3678upc7ws3	cmewyyevr0003w367fqkef44b	cmes17xx20005sii22wd8uj2i	1	\N	2025-08-29 15:09:52.988
\.


--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: ritikhariani
--

COPY public.courses (id, title, slug, description, author_id, status, featured, tags, created_at, updated_at) FROM stdin;
cmewyyevr0003w367fqkef44b	Sample	sample	testing	cmes0k0em0000sigj9dji5t1q	draft	t	\N	2025-08-29 15:09:52.984	2025-08-29 15:09:52.984
\.


--
-- Data for Name: media_files; Type: TABLE DATA; Schema: public; Owner: ritikhariani
--

COPY public.media_files (id, filename, original_name, file_size, mime_type, storage_path, thumbnail_path, uploaded_by, created_at) FROM stdin;
\.


--
-- Data for Name: module_media; Type: TABLE DATA; Schema: public; Owner: ritikhariani
--

COPY public.module_media (id, module_id, media_file_id, created_at) FROM stdin;
\.


--
-- Data for Name: modules; Type: TABLE DATA; Schema: public; Owner: ritikhariani
--

COPY public.modules (id, title, slug, content, description, author_id, parent_module_id, sort_order, module_number, status, created_at, updated_at) FROM stdin;
cmes16m170001sii225a1sbnn	Intro to BCS	intro-to-bcs	<p>This is an introductory module to BCS. <br><br>#Hello, this is Ritik Hariani<br><br>## I am building this website for Dr. Jon<br><br><strong>Testing</strong></p>	This module is an introduction to BCS	cmes0k0em0000sigj9dji5t1q	\N	1	2	draft	2025-08-26 04:13:23.851	2025-08-28 02:49:33.104
cmes17xx20005sii22wd8uj2i	This is a submodule	this-is-a-submodule	<p>Trying to test</p>	Testing a submodule	cmes0k0em0000sigj9dji5t1q	cmes16m170001sii225a1sbnn	1	2.1	draft	2025-08-26 04:14:25.911	2025-08-28 02:49:33.105
cmes178u20003sii2leoksxok	This is Test number 2	this-is-test-number-2	<p>Testing a draft module</p>	Testing a draft module	cmes0k0em0000sigj9dji5t1q	cmes16m170001sii225a1sbnn	0	1	published	2025-08-26 04:13:53.403	2025-09-02 05:34:03.41
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: ritikhariani
--

COPY public.sessions (id, session_token, user_id, expires, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: ritikhariani
--

COPY public.users (id, email, password_hash, name, role, created_at, updated_at) FROM stdin;
cmes0k0em0000sigj9dji5t1q	ritik@gmail.com	$2b$12$J3SyxjWW1don6IeOcc7pae1.xUJ/5WgZHnNvpMkCQX4BqJ9Lxv4ta	Ritik Hariani	faculty	2025-08-26 03:55:49.391	2025-08-26 03:55:49.391
\.


--
-- Name: course_modules course_modules_pkey; Type: CONSTRAINT; Schema: public; Owner: ritikhariani
--

ALTER TABLE ONLY public.course_modules
    ADD CONSTRAINT course_modules_pkey PRIMARY KEY (id);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: ritikhariani
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- Name: media_files media_files_pkey; Type: CONSTRAINT; Schema: public; Owner: ritikhariani
--

ALTER TABLE ONLY public.media_files
    ADD CONSTRAINT media_files_pkey PRIMARY KEY (id);


--
-- Name: module_media module_media_pkey; Type: CONSTRAINT; Schema: public; Owner: ritikhariani
--

ALTER TABLE ONLY public.module_media
    ADD CONSTRAINT module_media_pkey PRIMARY KEY (id);


--
-- Name: modules modules_pkey; Type: CONSTRAINT; Schema: public; Owner: ritikhariani
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: ritikhariani
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: ritikhariani
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: course_modules_course_id_idx; Type: INDEX; Schema: public; Owner: ritikhariani
--

CREATE INDEX course_modules_course_id_idx ON public.course_modules USING btree (course_id);


--
-- Name: course_modules_course_id_module_id_key; Type: INDEX; Schema: public; Owner: ritikhariani
--

CREATE UNIQUE INDEX course_modules_course_id_module_id_key ON public.course_modules USING btree (course_id, module_id);


--
-- Name: course_modules_course_id_sort_order_key; Type: INDEX; Schema: public; Owner: ritikhariani
--

CREATE UNIQUE INDEX course_modules_course_id_sort_order_key ON public.course_modules USING btree (course_id, sort_order);


--
-- Name: course_modules_module_id_idx; Type: INDEX; Schema: public; Owner: ritikhariani
--

CREATE INDEX course_modules_module_id_idx ON public.course_modules USING btree (module_id);


--
-- Name: courses_author_id_idx; Type: INDEX; Schema: public; Owner: ritikhariani
--

CREATE INDEX courses_author_id_idx ON public.courses USING btree (author_id);


--
-- Name: courses_slug_idx; Type: INDEX; Schema: public; Owner: ritikhariani
--

CREATE INDEX courses_slug_idx ON public.courses USING btree (slug);


--
-- Name: courses_slug_key; Type: INDEX; Schema: public; Owner: ritikhariani
--

CREATE UNIQUE INDEX courses_slug_key ON public.courses USING btree (slug);


--
-- Name: courses_status_idx; Type: INDEX; Schema: public; Owner: ritikhariani
--

CREATE INDEX courses_status_idx ON public.courses USING btree (status);


--
-- Name: media_files_mime_type_idx; Type: INDEX; Schema: public; Owner: ritikhariani
--

CREATE INDEX media_files_mime_type_idx ON public.media_files USING btree (mime_type);


--
-- Name: media_files_uploaded_by_idx; Type: INDEX; Schema: public; Owner: ritikhariani
--

CREATE INDEX media_files_uploaded_by_idx ON public.media_files USING btree (uploaded_by);


--
-- Name: module_media_media_file_id_idx; Type: INDEX; Schema: public; Owner: ritikhariani
--

CREATE INDEX module_media_media_file_id_idx ON public.module_media USING btree (media_file_id);


--
-- Name: module_media_module_id_idx; Type: INDEX; Schema: public; Owner: ritikhariani
--

CREATE INDEX module_media_module_id_idx ON public.module_media USING btree (module_id);


--
-- Name: module_media_module_id_media_file_id_key; Type: INDEX; Schema: public; Owner: ritikhariani
--

CREATE UNIQUE INDEX module_media_module_id_media_file_id_key ON public.module_media USING btree (module_id, media_file_id);


--
-- Name: modules_author_id_idx; Type: INDEX; Schema: public; Owner: ritikhariani
--

CREATE INDEX modules_author_id_idx ON public.modules USING btree (author_id);


--
-- Name: modules_parent_module_id_idx; Type: INDEX; Schema: public; Owner: ritikhariani
--

CREATE INDEX modules_parent_module_id_idx ON public.modules USING btree (parent_module_id);


--
-- Name: modules_parent_module_id_sort_order_key; Type: INDEX; Schema: public; Owner: ritikhariani
--

CREATE UNIQUE INDEX modules_parent_module_id_sort_order_key ON public.modules USING btree (parent_module_id, sort_order);


--
-- Name: modules_status_idx; Type: INDEX; Schema: public; Owner: ritikhariani
--

CREATE INDEX modules_status_idx ON public.modules USING btree (status);


--
-- Name: sessions_session_token_key; Type: INDEX; Schema: public; Owner: ritikhariani
--

CREATE UNIQUE INDEX sessions_session_token_key ON public.sessions USING btree (session_token);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: ritikhariani
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: course_modules course_modules_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ritikhariani
--

ALTER TABLE ONLY public.course_modules
    ADD CONSTRAINT course_modules_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: course_modules course_modules_module_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ritikhariani
--

ALTER TABLE ONLY public.course_modules
    ADD CONSTRAINT course_modules_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.modules(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: courses courses_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ritikhariani
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: media_files media_files_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ritikhariani
--

ALTER TABLE ONLY public.media_files
    ADD CONSTRAINT media_files_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: module_media module_media_media_file_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ritikhariani
--

ALTER TABLE ONLY public.module_media
    ADD CONSTRAINT module_media_media_file_id_fkey FOREIGN KEY (media_file_id) REFERENCES public.media_files(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: module_media module_media_module_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ritikhariani
--

ALTER TABLE ONLY public.module_media
    ADD CONSTRAINT module_media_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.modules(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: modules modules_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ritikhariani
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: modules modules_parent_module_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ritikhariani
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_parent_module_id_fkey FOREIGN KEY (parent_module_id) REFERENCES public.modules(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ritikhariani
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict JlfXNFgUsvhIskHJzTKIU3fybg6Ky89QCRVW4WfrWTUcF7Nm6eTLnpbg536GGD1

