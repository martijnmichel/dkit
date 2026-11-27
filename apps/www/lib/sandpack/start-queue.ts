/**
 * Serialize Sandpack Nodebox boots. Concurrent spawns on dkit.run often get
 * DNS failures (`ERR_NAME_NOT_RESOLVED`) so only the first preview works.
 */
type Starter = () => void;

let chain: Promise<void> = Promise.resolve();
const GAP_MS = 2800;

export function enqueueSandpackStart(start: Starter): () => void {
  let cancelled = false;
  chain = chain.then(
    () =>
      new Promise<void>((resolve) => {
        if (!cancelled) start();
        window.setTimeout(resolve, GAP_MS);
      }),
  );
  return () => {
    cancelled = true;
  };
}
