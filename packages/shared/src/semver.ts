/** Compare major.minor.patch loosely; returns -1 / 0 / 1 */
export function compareSemver(a: string, b: string): number {
  const pa = parse(a);
  const pb = parse(b);
  for (let i = 0; i < 3; i++) {
    if (pa[i] < pb[i]) return -1;
    if (pa[i] > pb[i]) return 1;
  }
  return 0;
}

export function majorVersion(version: string): number {
  return parse(version)[0];
}

function parse(version: string): [number, number, number] {
  const cleaned = version.replace(/^v/i, "").split("-")[0] ?? "0.0.0";
  const parts = cleaned.split(".").map((p) => Number.parseInt(p, 10) || 0);
  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0];
}
