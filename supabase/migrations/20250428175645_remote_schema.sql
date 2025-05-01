

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


CREATE EXTENSION IF NOT EXISTS "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."notify_new_membership"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  perform net.http_post(
    url := 'https://fungolwlkfwkyfdyevrq.functions.supabase.co/welcome-email',
    headers := json_build_object('Content-Type', 'application/json'),
    body := json_build_object('record', row_to_json(NEW))
  );
  return new;
end;
$$;


ALTER FUNCTION "public"."notify_new_membership"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_new_note"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  perform net.http_post(
    url := 'https://fungolwlkfwkyfdyevrq.functions.supabase.co/notify-group-note',
    headers := json_build_object('Content-Type', 'application/json'),
    body := json_build_object('record', row_to_json(NEW))
  );
  return new;
end;
$$;


ALTER FUNCTION "public"."notify_new_note"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."admin_users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" "text" NOT NULL
);


ALTER TABLE "public"."admin_users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."folder_letters" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "letter" "text" NOT NULL,
    "label" "text" NOT NULL,
    "language" "text" NOT NULL
);


ALTER TABLE "public"."folder_letters" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."groups" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text"
);


ALTER TABLE "public"."groups" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."memberships" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "group_id" "uuid"
);


ALTER TABLE "public"."memberships" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."permissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_email" "text" NOT NULL,
    "group_id" "uuid" NOT NULL,
    "can_add_note" boolean DEFAULT false,
    "can_edit_note" boolean DEFAULT false,
    "can_delete_note" boolean DEFAULT false,
    "can_manage_members" boolean DEFAULT false
);


ALTER TABLE "public"."permissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "full_name" "text",
    "email" "text",
    "license_expires_at" "date",
    "password" "text"
);


ALTER TABLE "public"."users" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."full_memberships" AS
 SELECT "u"."id" AS "user_id",
    "u"."full_name",
    "u"."email",
    "g"."id" AS "group_id",
    "g"."name" AS "group_name",
    COALESCE("p"."can_add_note", false) AS "can_add_note",
    COALESCE("p"."can_edit_note", false) AS "can_edit_note",
    COALESCE("p"."can_delete_note", false) AS "can_delete_note",
    COALESCE("p"."can_manage_members", false) AS "can_manage_members",
    "u"."license_expires_at",
    ("u"."license_expires_at" - CURRENT_DATE) AS "license_days_left"
   FROM ((("public"."memberships" "m"
     JOIN "public"."users" "u" ON (("m"."user_id" = "u"."id")))
     JOIN "public"."groups" "g" ON (("m"."group_id" = "g"."id")))
     LEFT JOIN "public"."permissions" "p" ON ((("p"."user_email" = "u"."email") AND ("p"."group_id" = "g"."id"))));


ALTER TABLE "public"."full_memberships" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."words" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "group_id" "uuid" NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"(),
    "title" "text" NOT NULL,
    "image_url" "text",
    "formatted_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "author_name" "text",
    "folder_letter_id" "uuid"
);


ALTER TABLE "public"."words" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."full_words" AS
 SELECT "w"."id",
    "w"."title",
    "w"."group_id",
    "w"."user_id",
    "f"."letter" AS "folder_letter",
    "f"."label" AS "folder_letter_label",
    "f"."language" AS "folder_letter_language"
   FROM ("public"."words" "w"
     LEFT JOIN "public"."folder_letters" "f" ON (("w"."folder_letter_id" = "f"."id")));


ALTER TABLE "public"."full_words" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notes" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "title" "text",
    "content" "text",
    "image_url" "text",
    "folder_type" "text",
    "category" "text",
    "user_id" "uuid" DEFAULT "auth"."uid"(),
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."notes" OWNER TO "postgres";


ALTER TABLE ONLY "public"."admin_users"
    ADD CONSTRAINT "admin_users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."admin_users"
    ADD CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."folder_letters"
    ADD CONSTRAINT "folder_letters_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."groups"
    ADD CONSTRAINT "groups_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."memberships"
    ADD CONSTRAINT "memberships_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notes"
    ADD CONSTRAINT "notes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."permissions"
    ADD CONSTRAINT "permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."permissions"
    ADD CONSTRAINT "permissions_user_email_group_id_key" UNIQUE ("user_email", "group_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."words"
    ADD CONSTRAINT "words_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."memberships"
    ADD CONSTRAINT "memberships_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."memberships"
    ADD CONSTRAINT "memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notes"
    ADD CONSTRAINT "notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."permissions"
    ADD CONSTRAINT "permissions_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."words"
    ADD CONSTRAINT "words_folder_letter_id_fkey" FOREIGN KEY ("folder_letter_id") REFERENCES "public"."folder_letters"("id");



ALTER TABLE ONLY "public"."words"
    ADD CONSTRAINT "words_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id");



ALTER TABLE ONLY "public"."words"
    ADD CONSTRAINT "words_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



CREATE POLICY "Admin can delete groups" ON "public"."groups" FOR DELETE USING ((("auth"."jwt"() ->> 'email'::"text") = 'blu4ck@outlook.com'::"text"));



CREATE POLICY "Admin can update groups" ON "public"."groups" FOR UPDATE USING ((("auth"."jwt"() ->> 'email'::"text") = 'blu4ck@outlook.com'::"text")) WITH CHECK (true);



CREATE POLICY "Admin email can insert users" ON "public"."users" FOR INSERT WITH CHECK ((("auth"."jwt"() ->> 'email'::"text") = 'blu4ck@outlook.com'::"text"));



CREATE POLICY "Authenticated users can read groups" ON "public"."groups" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Group admins can delete group members" ON "public"."memberships" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."permissions"
  WHERE (("permissions"."group_id" = "memberships"."group_id") AND ("permissions"."user_email" = ("auth"."jwt"() ->> 'email'::"text")) AND ("permissions"."can_manage_members" = true)))));



CREATE POLICY "Group members can insert words" ON "public"."words" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."permissions"
  WHERE (("permissions"."group_id" = "words"."group_id") AND ("permissions"."user_email" = "auth"."email"()) AND ("permissions"."can_add_note" = true)))));



CREATE POLICY "Group members can read words" ON "public"."words" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."permissions"
  WHERE (("permissions"."group_id" = "words"."group_id") AND ("permissions"."user_email" = "auth"."email"())))));



CREATE POLICY "Service can insert groups" ON "public"."groups" FOR INSERT TO "service_role" WITH CHECK (true);



CREATE POLICY "System can insert memberships" ON "public"."memberships" FOR INSERT TO "service_role" WITH CHECK (true);



CREATE POLICY "System can insert permissions" ON "public"."permissions" FOR INSERT TO "service_role" WITH CHECK (true);



CREATE POLICY "User can read self" ON "public"."users" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can access their own notes" ON "public"."notes" TO "authenticated" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can read their permissions" ON "public"."permissions" FOR SELECT USING (("user_email" = ("auth"."jwt"() ->> 'email'::"text")));



CREATE POLICY "Users can update their own words" ON "public"."words" FOR UPDATE TO "authenticated" USING ((("user_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."permissions"
  WHERE (("permissions"."group_id" = "words"."group_id") AND ("permissions"."user_email" = "auth"."email"()) AND ("permissions"."can_edit_note" = true))))));



CREATE POLICY "Users can view their memberships" ON "public"."memberships" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users with delete permission can delete words" ON "public"."words" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."permissions"
  WHERE (("permissions"."group_id" = "words"."group_id") AND ("permissions"."user_email" = "auth"."email"()) AND ("permissions"."can_delete_note" = true)))));



ALTER TABLE "public"."groups" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."memberships" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."permissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."words" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";




















































































































































































GRANT ALL ON FUNCTION "public"."notify_new_membership"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_new_membership"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_new_membership"() TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_new_note"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_new_note"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_new_note"() TO "service_role";


















GRANT ALL ON TABLE "public"."admin_users" TO "anon";
GRANT ALL ON TABLE "public"."admin_users" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_users" TO "service_role";



GRANT ALL ON TABLE "public"."folder_letters" TO "anon";
GRANT ALL ON TABLE "public"."folder_letters" TO "authenticated";
GRANT ALL ON TABLE "public"."folder_letters" TO "service_role";



GRANT ALL ON TABLE "public"."groups" TO "anon";
GRANT ALL ON TABLE "public"."groups" TO "authenticated";
GRANT ALL ON TABLE "public"."groups" TO "service_role";



GRANT ALL ON TABLE "public"."memberships" TO "anon";
GRANT ALL ON TABLE "public"."memberships" TO "authenticated";
GRANT ALL ON TABLE "public"."memberships" TO "service_role";



GRANT ALL ON TABLE "public"."permissions" TO "anon";
GRANT ALL ON TABLE "public"."permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."permissions" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON TABLE "public"."full_memberships" TO "anon";
GRANT ALL ON TABLE "public"."full_memberships" TO "authenticated";
GRANT ALL ON TABLE "public"."full_memberships" TO "service_role";



GRANT ALL ON TABLE "public"."words" TO "anon";
GRANT ALL ON TABLE "public"."words" TO "authenticated";
GRANT ALL ON TABLE "public"."words" TO "service_role";



GRANT ALL ON TABLE "public"."full_words" TO "anon";
GRANT ALL ON TABLE "public"."full_words" TO "authenticated";
GRANT ALL ON TABLE "public"."full_words" TO "service_role";



GRANT ALL ON TABLE "public"."notes" TO "anon";
GRANT ALL ON TABLE "public"."notes" TO "authenticated";
GRANT ALL ON TABLE "public"."notes" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
