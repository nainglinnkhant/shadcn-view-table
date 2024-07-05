ALTER TABLE "shadcn_views" ADD COLUMN "filter_params" json;--> statement-breakpoint
ALTER TABLE "shadcn_views" DROP COLUMN IF EXISTS "filters";