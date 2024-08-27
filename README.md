# Shadcn View Table

Shadcn table component with server side sorting, pagination, filtering, and custom views. This is built on top of [@sadmann17](https://x.com/sadmann17)'s [shadcn-table](https://github.com/sadmann7/shadcn-table).

<img width="1440" alt="Screenshot 2024-07-10 at 5 46 33 PM" src="https://github.com/user-attachments/assets/ef0f9158-02f0-49de-bc14-3905324ca322">

## Tech Stack

- Next.js
- TailwindCSS
- shadcn/ui
- tanstack/react-table
- Drizzle ORM
- Supabase
- Zod

## Running locally

1. Clone the repository

   ```bash
   git clone https://github.com/nainglinnkhant/shadcn-view-table
   ```

2. Install dependencies using pnpm

   ```bash
   pnpm install
   ```

3. Copy the `.env.example` to `.env` and update the variables.

   ```bash
   cp .env.example .env
   ```

4. Push the database schema

   ```bash
   pnpm db:push
   ```

5. Start the development server

   ```bash
   pnpm dev
   ```

You can read more about setting up your own table [here](https://github.com/sadmann7/shadcn-table?tab=readme-ov-file#build-your-own-table).
