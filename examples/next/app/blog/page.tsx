import { SetupHint } from "../_components/setup-hint";
import { List, installed } from "@/lib/dkit/entries/blog";

export default function BlogPage() {
  if (!installed) return <SetupHint />;
  return <List />;
}
