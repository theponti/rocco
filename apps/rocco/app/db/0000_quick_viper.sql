CREATE TYPE "public"."ItemType" AS ENUM('FLIGHT', 'PLACE');--> statement-breakpoint
CREATE TABLE "bookmark" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"url" text NOT NULL,
	"image" text,
	"imageHeight" text,
	"imageWidth" text,
	"locationAddress" text,
	"locationLat" text,
	"locationLng" text,
	"siteName" text NOT NULL,
	"userId" uuid NOT NULL,
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "item" (
	"id" uuid PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) DEFAULT now() NOT NULL,
	"itemId" uuid NOT NULL,
	"listId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"itemType" "ItemType" DEFAULT 'PLACE' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "list" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"userId" uuid NOT NULL,
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) DEFAULT now() NOT NULL,
	"isPublic" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "list_invite" (
	"accepted" boolean DEFAULT false NOT NULL,
	"listId" uuid NOT NULL,
	"invitedUserEmail" text NOT NULL,
	"invitedUserId" uuid,
	"userId" uuid NOT NULL,
	"acceptedAt" timestamp(3),
	CONSTRAINT "list_invite_pkey" PRIMARY KEY("listId","invitedUserEmail")
);
--> statement-breakpoint
CREATE TABLE "place" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"address" text,
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) DEFAULT now() NOT NULL,
	"userId" uuid NOT NULL,
	"itemId" uuid,
	"google_maps_id" text,
	"types" text[],
	"imageUrl" text,
	"phoneNumber" text,
	"rating" double precision,
	"websiteUri" text,
	"latitude" double precision,
	"longitude" double precision,
	"location" geometry(point) NOT NULL,
	"best_for" text,
	"is_public" boolean DEFAULT false NOT NULL,
	"wifi_info" text,
	"photos" text[],
	"price_level" integer
);
--> statement-breakpoint
CREATE TABLE "place_tags" (
	"place_id" uuid,
	"tag_id" uuid
);
--> statement-breakpoint
CREATE TABLE "place_visits" (
	"event_id" uuid,
	"place_id" uuid,
	"notes" text,
	"rating" integer,
	"review" text,
	"people" text,
	"user_id" uuid
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"user_id" uuid
);
--> statement-breakpoint
CREATE TABLE "user_lists" (
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) DEFAULT now() NOT NULL,
	"listId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	CONSTRAINT "user_lists_pkey" PRIMARY KEY("listId","userId")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"image" text,
	"supabase_id" text,
	"isAdmin" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) DEFAULT now() NOT NULL,
	"emailVerified" timestamp(3),
	"photo_url" text,
	"birthday" text,
	CONSTRAINT "users_supabase_id_unique" UNIQUE("supabase_id")
);
--> statement-breakpoint
ALTER TABLE "item" ADD CONSTRAINT "item_listId_list_id_fk" FOREIGN KEY ("listId") REFERENCES "public"."list"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "list_invite" ADD CONSTRAINT "list_invite_listId_list_id_fk" FOREIGN KEY ("listId") REFERENCES "public"."list"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "place" ADD CONSTRAINT "place_itemId_item_id_fk" FOREIGN KEY ("itemId") REFERENCES "public"."item"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "place_tags" ADD CONSTRAINT "place_tags_place_id_place_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."place"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "place_tags" ADD CONSTRAINT "place_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "place_visits" ADD CONSTRAINT "place_visits_place_id_place_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."place"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_lists" ADD CONSTRAINT "user_lists_listId_list_id_fk" FOREIGN KEY ("listId") REFERENCES "public"."list"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "item_listId_itemId_key" ON "item" USING btree ("listId" uuid_ops,"itemId" uuid_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "User_email_key" ON "users" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "email_idx" ON "users" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "supabase_id_idx" ON "users" USING btree ("supabase_id" text_ops);