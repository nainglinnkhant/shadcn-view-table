CREATE TABLE IF NOT EXISTS "shadcn_views" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"name" text NOT NULL,
	"columns" text[],
	"filters" json[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT current_timestamp,
	CONSTRAINT "shadcn_views_name_unique" UNIQUE("name")
);
