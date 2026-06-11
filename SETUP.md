# Allianz Tracker — Supabase setup (one-time, ~10 minutes)

The app now saves all data to a shared **Supabase** database with **live sync** —
everyone with the link sees the same data, and changes appear on everyone's screen
within about a second.

## 1. Create a free Supabase project
1. Go to https://supabase.com and sign up (free).
2. Click **New project**. Give it any name, set a database password (save it
   somewhere), pick the region closest to you, and create it.
3. Wait ~2 minutes for it to finish setting up.

## 2. Create the table (copy–paste, once)
1. In your project, open **SQL Editor** (left sidebar) → **New query**.
2. Paste the block below and click **Run**.

```sql
create table if not exists public.tracker (
  id text primary key,
  data jsonb,
  updated_at timestamptz default now()
);

-- needed so live updates carry the full row
alter table public.tracker replica identity full;

-- allow the app (using the public anon key) to read & write
alter table public.tracker enable row level security;
create policy "anon full access" on public.tracker
  for all to anon using (true) with check (true);

-- turn on realtime / live sync for this table
alter publication supabase_realtime add table public.tracker;
```

> **How the data is stored:** each Managing Agent gets its own row (id = `ma-0`, `ma-1`, etc.).
> This means 6 people editing different MAs at the same time **never conflict** — they each
> touch a different row. The first time the app loads it will automatically populate all rows.
> You don't need to do anything extra.

## 3. Get your two keys
1. Open **Project Settings** (gear icon) → **API**.
2. Copy **Project URL** (looks like `https://abcd1234.supabase.co`).
3. Copy the **anon / public** key (a long string). This one is safe to be public.

## 4. Put them in the app
Open `public/index.html`, find the **SUPABASE CONFIG** block near the top of the
`<script>` and replace the two placeholders:

```js
const SUPABASE_URL      = "https://abcd1234.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOi...your-long-anon-key...";
```

## 5. Deploy
Commit and push to GitHub — Render will redeploy automatically:

```
git add -A
git commit -m "Move data to Supabase with live sync"
git push
```

That's it. The header pill will show **🟢 Live** when it's connected.

---

### Note on access
Anyone who has the website link can view and edit (that's how live sharing works).
The anon key being public is fine — it only allows what the policy above allows.
If you later want a password gate or per-user logins, that can be added.
