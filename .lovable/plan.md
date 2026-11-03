# Security hardening

Checked first: one admin account exists, the auto-admin trigger `on_auth_user_created_assign_admin` is present, and every saved project link already starts with https, so the new rules won't fail on existing data.

## Steps
1. Apply one database migration with the SQL exactly as you gave it:
   - Remove the trigger and the function that made the first sign-up an admin
   - Stop anonymous callers from running `has_role`; keep it for signed-in users and the server
   - Add the https-only rules for project live and repo links
2. Auth settings: turn off public sign-ups and turn on leaked password protection. Leave auto-confirm and anonymous sign-ins off.
3. Run the security linter and confirm the migration landed (trigger gone, constraints present, function permissions correct).

## Not touched
App code, RLS policies, the user_roles table, existing rows.

## Note
The migration removes a trigger and a function, so it may ask for your approval before it runs.
