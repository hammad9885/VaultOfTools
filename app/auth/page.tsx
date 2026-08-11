import { redirect } from "next/navigation";

/** Legacy path — public auth lives at /login (Firebase). */
export default function AuthRedirectPage() {
  redirect("/login");
}
