import { env } from "@/env"

export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "Shadcn View Table",
  description:
    "Shadcn table component with server side sorting, pagination, filtering, and custom views.",
  url:
    env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://view-table.nainglinnkhant.com",
  links: { github: "https://github.com/nainglinnkhant/shadcn-view-table" },
}
