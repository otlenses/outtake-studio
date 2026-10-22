import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/server/dal";
import LoginForm from "./LoginForm";

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) redirect("/admin");

  return <LoginForm />;
}
