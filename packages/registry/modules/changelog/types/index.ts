export type ReleaseStatus = "shipped" | "in_progress" | "planned";

export type Release = {
  id: string;
  status: ReleaseStatus;
  version: string;
  title: string;
  body?: string | null;
  tags?: string[] | null;
  released_at?: string | null;
};
