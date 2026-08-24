// ============================================================================
// WealthFlow AI — migration runner
//
// Applies src/db/migrations.sql against DATABASE_URL (Neon). The SQL is
// idempotent (CREATE ... IF NOT EXISTS), so it is safe to run repeatedly.
//
// Usage:
//   bun run src/db/migrate.ts            # run migrations against DATABASE_URL
//   DATABASE_URL=... bun run src/db/migrate.ts
//
// The runner splits the file on top-level semicolons and executes each
// statement sequentially (some drivers barf at multi-statement batches that
// include PL/pgSQL DO blocks — statements are much safer).
//
// Fixes for Stage 2 -> live DB:
//   1) CLI entrypoint: `bun run src/db/migrate.ts` passes a RELATIVE argv[1],
//      so comparing it to fileURLToPath(import.meta.url) (absolute) never
//      matched and the runner silently exited 0 without doing anything.
//      We now realpathSync() argv[1] before comparing.
//   2) splitStatements() now tracks PostgreSQL $$ / $tag$ dollar-quoting so
//      the DO $$ ... $$; ENUM blocks are kept whole (their inner semicolons
//      previously looked like statement boundaries and produced bad fragments).
// ============================================================================
import { readFileSync, realpathSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = dirname(fileURLToPath(import.meta.url));
export const MIGRATIONS_FILE = join(__dirname, "migrations.sql");

/**
 * Split SQL on top-level semicolons.
 * Ignores semicolons inside single-quoted, double-quoted, and PostgreSQL
 * dollar-quoted ($$ or $tag$) strings, and skips `--` line comments.
 */
export function splitStatements(sql: string): string[] {
  const out: string[] = [];
  let current = "";
  let inQuote: string | null = null; // ' or "
  let dollarTag: string | null = null; // e.g. "$$" or "$tag$"
  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];

    // Inside a dollar-quoted string. Look for the matching closing tag.
    if (dollarTag !== null) {
      current += ch;
      if (sql.startsWith(dollarTag, i)) {
        current += dollarTag.slice(1);
        i += dollarTag.length - 1;
        dollarTag = null;
      }
      continue;
    }

    // Inside a ' or " quoted string.
    if (inQuote) {
      current += ch;
      if (ch === inQuote && sql[i - 1] !== "\\") {
        // handle doubled single-quote escape ('' inside a string)
        if (ch === "'" && sql[i + 1] === "'") {
          current += sql[++i];
          continue;
        }
        inQuote = null;
      }
      continue;
    }

    // Detect the start of a dollar-quoted string: $[tag]$
    if (ch === "$") {
      let j = i + 1;
      while (j < sql.length && /[A-Za-z0-9_]/.test(sql[j])) j++;
      if (j < sql.length && sql[j] === "$") {
        dollarTag = sql.slice(i, j + 1);
        current += dollarTag;
        i = j;
        continue;
      }
      current += ch;
      continue;
    }

    if (ch === "'" || ch === '"') {
      inQuote = ch;
      current += ch;
      continue;
    }
    if (ch === "-" && sql[i + 1] === "-") {
      // skip line comment
      while (i < sql.length && sql[i] !== "\n") i++;
      continue;
    }
    if (ch === ";") {
      const stmt = current.trim();
      if (stmt) out.push(stmt);
      current = "";
      continue;
    }
    current += ch;
  }
  const last = current.trim();
  if (last) out.push(last);
  return out;
}

export async function runMigrations(dbUrl: string | undefined): Promise<{
  applied: number;
  statements: string[];
}> {
  if (!dbUrl) {
    throw new Error(
      "DATABASE_URL is not set — connect a database before running migrations."
    );
  }
  const { neon } = await import("@neondatabase/serverless");
  const sql = neon(dbUrl);
  const file = readFileSync(MIGRATIONS_FILE, "utf8");
  const statements = splitStatements(file);
  let applied = 0;
  for (const stmt of statements) {
    // neon 1.x: `sql.unsafe()` returns an UnsafeRawSql marker that must be
    // interpolated into the tagged template to execute. Calling it directly
    // (as in older neon API versions) silently does nothing.
    await sql`${sql.unsafe(stmt)}`;
    applied++;
  }
  return { applied, statements };
}

// CLI entrypoint — run whenever this file is the direct entry (bun run ...).
// argv[1] may be relative or absolute, so normalize with realpathSync.
function isEntry(): boolean {
  const argv1 = process.argv[1];
  if (!argv1) return false;
  try {
    return realpathSync(argv1) === fileURLToPath(import.meta.url);
  } catch {
    return false;
  }
}

if (isEntry()) {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error(
      "DATABASE_URL is not set — connect a database (via the database card) first."
    );
    process.exit(1);
  }
  runMigrations(url)
    .then((r) => {
      console.log(`Applied ${r.applied} migration statement(s) successfully.`);
    })
    .catch((e) => {
      console.error("Migration failed:", e);
      process.exit(1);
    });
}
