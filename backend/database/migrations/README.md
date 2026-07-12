# Migrations

SQL migration files applied in alphabetical order by `scripts/migrate.js`.

## Naming

```
NNN_descriptive_name.sql        # forward migration
NNN_descriptive_name.down.sql   # optional rollback
```

The runner records the forward filename in `schema_migrations`. To revert the last
applied migration, run `npm run migrate:undo`. If a matching `.down.sql` file
exists it is applied and the record removed; otherwise a warning is shown.

## Idempotency

All migrations use `CREATE TABLE IF NOT EXISTS` / `CREATE INDEX IF NOT EXISTS`
and `DROP TRIGGER IF EXISTS` so re-running is safe.
