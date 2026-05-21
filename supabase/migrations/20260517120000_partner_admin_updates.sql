-- Admin console: allow updates to partner branding (local dev / anon until auth lands)

drop policy if exists "partner_branding_update_anon" on public.partner_branding;
create policy "partner_branding_update_anon"
  on public.partner_branding for update
  to anon, authenticated
  using (true)
  with check (true);
