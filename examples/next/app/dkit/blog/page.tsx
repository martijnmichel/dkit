import { List, installed } from "@/components/dkit/blog";

export default function DkitBlogPage() {
  if (!installed) {
    return <p>List is not installed yet.</p>;
  }
  return <List />;
}
