
## Database
The database of this project is managed by [Supabase](https://supabase.com/), which provides the backend services for authentication, database management, and API generation.

### Run Supabase locally
To run Supabase locally, follow these steps:
1. Install the Supabase CLI as development dependency (dependency already included in `package.json`):
   ```bash
   npm install supabase --save-dev
   ```
2. Start the Supabase local development environment (based on Docker):
   ```bash
   supabase start
   ```
   The first time you run this command, it will download the necessary Docker images, which may take some time.
3. If you want to stop the Supabase local development environment:
   ```bash
   supabase stop
   ```
### Manage Database changes with Migrations
To manage database changes, you can use Supabase's migration feature.
Each change to the database schema should be captured in a sql migration file, which can be created using the Supabase CLI.

In order to report changes to the database schema, you can follow these steps:
1. Open Supabase Studio in your web browser by navigating to `http://localhost:54323/` (default port).
2. Make the desired changes to your database schema using the Supabase Studio interface.
3. After making changes, create a new migration file to capture the changes:
   ```bash
   supabase db diff --use-migra -f <migration_name>
   ```
    Replace `<migration_name>` with a descriptive name for the migration. It will create a new SQL file in the `supabase/migrations` directory.

Alternatively, if you prefer to create a migration file without using Supabase Studio, you can manually create a new SQL file in the `supabase/migrations` directory and write the necessary SQL commands to modify the database schema.
Then, step 2 and 3 can be skipped, and you can proceed to apply the migration:
```bash
supabase migration up 
```

Instead, if you want to update your local database schema directly from a migration file, you can run:
```bash
supabase migration up
```
This command will apply all pending migrations to your local database, ensuring that your schema is up to-date with the latest changes.

In case you also want to reset your local database to a clean state, you can use the following command instead of `supabase migration up`:
```bash
supabase db reset
```
This command will drop the existing database, recreate it, and apply all migrations from scratch, giving you a fresh start with the latest schema.
It is suggested to use this command when you want to ensure that your local database is in sync with the migration files, especially after making significant changes to the schema.
