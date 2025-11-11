# FeedDoctor

FeedDoctor is a full‑stack web application that helps merchants fix Google Merchant Center (GMC) disapprovals and discover new e‑commerce leads in a compliant way. It offers three core modules:

1. **FeedDoctor** – scan your existing product feed or store, identify issues such as missing GTINs, long titles and small images, and generate a ready‑to‑upload feed patch along with a GMC checklist.
2. **Outreach Intelligence** – discover Shopify stores in a niche, analyse their public product pages for common feed issues and generate polite outreach drafts (email and DM) that respect CASL and CAN‑SPAM.
3. **Inbox Assistant** – paste inbound messages and receive AI‑powered reply suggestions, or connect your Gmail (read‑only) to draft responses directly in Gmail. (Gmail integration is optional and disabled in this demo.)

> **Compliance first**: FeedDoctor never sends emails automatically. All outreach requires a manual “Send” step and includes a one‑click unsubscribe sentence. Scraping respects `robots.txt`; if a site disallows crawling, scraping is skipped and marked accordingly.

## Features

- **Landing Page** – upload a CSV/TSV feed file or enter your store URL to run a free quick scan. See sample issues and purchase a Fix Pack ($299) for up to 25 SKUs.
- **Dashboard** – simple admin interface guarded by a password (`ADMIN_PASS`) showing KPIs such as scans run, fix packs delivered and leads discovered.
- **Feed Scanner** – client page to upload a feed or URL, call an API to analyse it, and display detected issues and suggested title fixes. Offers checkout via Stripe.
- **Checkout & Fulfilment** – one‑time Stripe Checkout for $299. On success the app prompts for an email, generates deliverables (feed patch, title suggestions, image briefs and GMC checklist) and returns them as downloadable links. In demo mode deliverables are data URIs.
- **Outreach Discover** – search for stores by niche and country. Lists up to 1 000 stores with metadata (Shopify detection, contact page, email, Instagram) while respecting rate limits and robots.txt.
- **Outreach Analyse** – for selected stores, scrape up to five product pages, detect feed issues and suggest title fixes. Results are colour‑coded by severity.
- **Outreach Drafts** – generate compliant outreach drafts (email subject, personalised first line, body and DM version) for one or more stores. Includes copy buttons and Gmail deep links for manual sending.
- **Export** – download a CSV summarising stores, products, issues, suggested fixes and drafts for external reporting.
- **Pipeline** – simple Kanban board (New → Contacted → Interested → Closed) to manage your leads. Drag and drop cards between stages; data persists in memory in this demo.
- **Inbox Assistant** – paste inbound messages to classify them and generate suggested replies (lead, price enquiry, spam, etc.). Gmail integration is optional and not enabled in this demo.

## Tech Stack

- **Next.js 14** with the App Router and TypeScript for a modern full‑stack experience.
- **Tailwind CSS** for styling and a minimal, professional theme.
- **Prisma** with a SQLite database in development; switching to Postgres in production is as simple as changing `DATABASE_PROVIDER` and `DATABASE_URL`.
- **Zod** for robust input validation on both client and server.
- **Stripe** Checkout for one‑time payments.
- **Resend** for transactional emails (stubbed in demo).
- **Vercel Blob** for storing deliverables (stubbed in demo).
- **Cheerio** and **probe‑image‑size** for lightweight scraping and image probing (using regex/HEAD fallback in demo).
- Optional **NextAuth** with Google OAuth scopes for Gmail read‑only access and draft creation (not enabled by default).

## Getting Started

1. **Install dependencies**

   ```bash
   pnpm i
   # or npm install if you don’t use pnpm
   ```

2. **Set up the database**

   ```bash
   pnpm prisma:migrate
   pnpm prisma:generate
   pnpm prisma:seed # optional seed script (not included in demo)
   ```

   The default development configuration uses SQLite with the file `dev.db`. To switch to Postgres in production set `DATABASE_PROVIDER="postgresql"` and `DATABASE_URL` to your connection string in `.env` before running migrations.

3. **Configure environment variables**

   Copy `.env.example` to `.env` and fill in the following:

   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` and `STRIPE_SECRET_KEY` – create a product called **Feed Fix Pack** priced at $299 in your Stripe dashboard and copy the keys.
   - `RESEND_API_KEY` – obtain from [Resend](https://resend.com/) for sending transactional emails. In demo mode emails are logged to the console.
   - `ADMIN_PASS` – simple password to guard the `/dashboard` and internal routes.
   - `OPENAI_API_KEY` – optional. If provided, you can implement functions in `lib/llm.ts` to generate titles, outreach drafts and replies using OpenAI. In this demo we return canned responses.
   - `BLOB_READ_WRITE_TOKEN` – optional token for Vercel Blob. The demo uses data URIs instead of real uploads.
   - `MOCK_MODE` – set to `true` to return seeded/demo data without performing external network calls or scraping.
   - `RATE_LIMIT_MAX` – maximum number of POST requests per minute per IP on scan/fulfil/discover/analyze/drafts API routes.

   For optional Gmail integration you must set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_URL` and `NEXTAUTH_SECRET`. Scopes used are `openid email profile`, `https://www.googleapis.com/auth/gmail.readonly` and `https://www.googleapis.com/auth/gmail.compose` (not `gmail.send`). The `GMAIL_LABEL_FILTER` can be customised to filter relevant threads.

4. **Run the development server**

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the app. Use the **Admin Password** to access the dashboard and internal pages.

## Deployment

Deploy FeedDoctor to [Vercel](https://vercel.com/) for the best experience. Set the environment variables in your Vercel project. Vercel’s Serverless Functions will handle API routes and background tasks.

1. Push your repository to GitHub.
2. Create a new project on Vercel and import the repository.
3. Set environment variables in the Vercel dashboard.
4. Deploy. Vercel will build the Next.js application and provision a SQLite database by default. For Postgres, add a managed database and update `DATABASE_PROVIDER`/`DATABASE_URL`.

## Legal & Compliance

FeedDoctor is built with compliance and platform safety in mind:

- **No automatic emails or DMs** – the app only generates drafts. Users must click a Gmail deep link or copy/paste into their email/DM tool to send.
- **Robots.txt respect** – scraping functions check each site’s `robots.txt`. If crawling is disallowed, the product is skipped and marked as such.
- **CASL & CAN‑SPAM** – outreach drafts include a one‑click unsubscribe sentence. The README reminds users about Canadian and US anti‑spam laws.
- **Manual sending** – all outreach actions require manual confirmation (sending via Gmail or copying into Instagram). There is no background automation.
- **Rate limiting** – API routes are limited to five POST requests per minute per IP by default. Adjust `RATE_LIMIT_MAX` as needed.
- **Input validation & sanitisation** – all API routes validate input with Zod and escape special characters in file uploads and URLs. HTML is never rendered directly.
- **Secure storage** – in production deliverables are uploaded to Vercel Blob with signed URLs. Stripe webhooks verify signature secrets. Orders are stored in the database with payment status.

## Next Steps

This demo provides a robust foundation. To make the app production‑ready:

- Replace stubbed modules (`lib/llm.ts`, `lib/resend.ts`, `lib/stripe.ts`, `lib/blob.ts`) with real implementations and fill in your API keys.
- Remove `MOCK_MODE` or set it to `false` in production. Enable external network calls and scraping with proper error handling.
- Implement database seed scripts to create demo stores, products, issues and pipeline statuses.
- Build out Gmail integration via NextAuth and the Google API to list threads and create drafts (without sending).
- Add persistent storage for the Pipeline board and Inbox Assistant using Prisma models (`PipelineStatus` and a new `Message` model).
- Enhance the UI with reusable components (Table, Card, Modal, Toast) and ensure accessibility with proper labels and roles.

FeedDoctor aims to save merchants time by automatically highlighting and correcting feed issues while enabling responsible outreach. We hope this project accelerates your journey to compliant growth!# feeddoctor
