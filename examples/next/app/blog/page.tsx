import { SetupHint } from "../_components/setup-hint";
import { List, installed } from "@/components/dkit/blog";

export default function BlogPage() {
  if (!installed) return <SetupHint />;
  return <List />;
}
