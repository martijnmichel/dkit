export type SchemaSnapshot = {
  version?: number;
  directus?: string;
  vendor?: string;
  collections?: unknown[];
  fields?: unknown[];
  relations?: unknown[];
  [key: string]: unknown;
};

export type PolicyBundle = {
  policies?: PolicyRecord[];
  permissions?: PermissionRecord[];
  access?: AccessRecord[];
};

export type PolicyRecord = {
  name: string;
  icon?: string | null;
  description?: string | null;
  ip_access?: string[] | null;
  enforce_tfa?: boolean;
  admin_access?: boolean;
  app_access?: boolean;
  [key: string]: unknown;
};

export type PermissionRecord = {
  collection: string;
  action: "create" | "read" | "update" | "delete" | "share";
  permissions?: Record<string, unknown> | null;
  validation?: Record<string, unknown> | null;
  presets?: Record<string, unknown> | null;
  fields?: string[] | null;
  policy?: string;
  [key: string]: unknown;
};

export type AccessRecord = {
  role?: string | null;
  user?: string | null;
  policy: string;
  sort?: number | null;
  [key: string]: unknown;
};

export type FlowsBundle = {
  flows?: FlowRecord[];
  operations?: OperationRecord[];
};

export type FlowRecord = {
  id?: string;
  name: string;
  icon?: string | null;
  color?: string | null;
  description?: string | null;
  status?: string;
  trigger?: string;
  accountability?: string | null;
  options?: Record<string, unknown> | null;
  operation?: string | null;
  [key: string]: unknown;
};

export type OperationRecord = {
  id?: string;
  name: string;
  key: string;
  type: string;
  position_x?: number;
  position_y?: number;
  options?: Record<string, unknown> | null;
  resolve?: string | null;
  reject?: string | null;
  flow?: string;
  [key: string]: unknown;
};

export type SeedFile = {
  /** Stable UUID so re-seed can skip/reuse the same file */
  id: string;
  filename_download: string;
  title?: string;
  type?: string;
  /** Raw file bytes as base64 (no data: URL prefix) */
  data_base64: string;
};

export type SeedBundle = {
  /** Uploaded to /files before items; use file ids on image/file fields */
  files?: SeedFile[];
  items?: Record<string, Record<string, unknown>[]>;
};

export type ApplyOptions = {
  dryRun?: boolean;
  seed?: boolean;
  forceSchema?: boolean;
  confirmReducedSafety?: boolean;
  onLog?: (message: string) => void;
};

export type ApplyResult = {
  schemaApplied: boolean;
  policiesApplied: boolean;
  flowsApplied: boolean;
  seedApplied: boolean;
  warnings: string[];
  dryRunPlan: string[];
};
