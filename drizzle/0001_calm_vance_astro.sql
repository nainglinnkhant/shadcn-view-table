ALTER TABLE "shadcn_tasks" ALTER COLUMN "id" SET DATA TYPE uuid USING (uuid_generate_v4());--> statement-breakpoint
ALTER TABLE "shadcn_tasks" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();--> statement-breakpoint
ALTER TABLE "shadcn_tasks" ALTER COLUMN "code" SET NOT NULL;