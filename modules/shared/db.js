import { sql } from '@vercel/postgres'

if (!process.env.POSTGRES_URL) {
    console.warn("Postgres ambient variable POSTGRES_URL is not defined!");
}

export { sql };