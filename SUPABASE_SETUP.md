# Supabase reservation setup

The reservation UI now calls server-only Next.js endpoints. The service role key is never sent to the browser.

## 1. Run the database migration

Open **Supabase → SQL Editor**, paste the contents of \`supabase/migrations/20261027000000_reservations.sql\`, and run it once.

The migration creates:

- \`reservation_settings\`, including the restaurant capacity (36 seats by default).
- \`reservations\`, with guest details, status, timestamps, and a database exclusion constraint that prevents overlapping reservations.
- \`get_reservation_availability\`, which returns 30-minute slots based on opening hours, party duration, and remaining capacity.
- \`create_reservation\`, an atomic, capacity-aware booking function protected by a per-date advisory lock.

Change the capacity after the migration if needed:

\`\`\`sql
update public.reservation_settings
set capacity = 36, updated_at = now()
where id = true;
\`\`\`

## 2. Add the two environment variables

Create \`.env.local\` for local development and add the same values to the Vercel project's Environment Variables:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
\`\`\`

Use the Supabase project URL from **Project Settings → API**. Copy the **service_role** key from the same page.

\`NEXT_PUBLIC_SUPABASE_URL\` is safe to expose as a URL. \`SUPABASE_SERVICE_ROLE_KEY\` is a secret: keep it server-only, never prefix it with \`NEXT_PUBLIC_\`, never commit it, and rotate it if it is ever exposed.

No Supabase client is instantiated in browser code. No database credentials belong in \`.env.example\` beyond placeholders.

## 3. Verify

After adding variables, restart the local dev server or redeploy Vercel. The reservation form will then:

- request live availability for the selected date and guest count;
- reject unavailable slots server-side;
- store confirmed reservations securely in Supabase;
- store large-party inquiries for follow-up instead of requiring a phone call;
- keep the current UI and localized routes unchanged.

The API intentionally returns a generic error for missing configuration or unexpected database failures. It does not expose service-role credentials or raw database errors.
