import { run } from "./index.js";

function formatErr(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === "object") {
    const o = err as { errors?: Array<{ message?: string }>; message?: string };
    if (Array.isArray(o.errors) && o.errors[0]?.message) {
      return o.errors.map((e) => e.message).filter(Boolean).join("; ");
    }
    if (typeof o.message === "string") return o.message;
    try {
      return JSON.stringify(err);
    } catch {
      /* fall through */
    }
  }
  return String(err);
}

run(process.argv).catch((err: unknown) => {
  console.error(formatErr(err));
  process.exit(1);
});
