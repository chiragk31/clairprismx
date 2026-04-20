import { Button } from "@/components/ui/button";
import Logout from "@/module/auth/components/logout";
import { requiredAuth } from "@/module/auth/utils/auth-utils";
import Image from "next/image";
import { redirect } from "next/navigation";

export default async function Home() {
  await requiredAuth();
  return redirect("/dashboard");
}
