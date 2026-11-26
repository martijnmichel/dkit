export type FormSubmission = {
  id: string;
  status: "new" | "read" | "archived";
  name: string;
  email: string;
  message: string;
  created_at?: string | null;
};

export type FormSubmissionInput = {
  name: string;
  email: string;
  message: string;
};
