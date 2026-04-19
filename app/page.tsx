import { Button } from "@/components/ui/button";
import Logout from "@/module/auth/components/logout";
import { requiredAuth } from "@/module/auth/utils/auth-utils";
import Image from "next/image";

export default async function Home() {
  await requiredAuth();
  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-24">
     
      <Logout><Button>Logout</Button></Logout>
    </div>
  );
}
