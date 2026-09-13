import { redirect } from "next/navigation";
import { currentUser } from "@/lib/session";
import TalkClient from "./TalkClient";

export default async function TalkPage() {
  const user = await currentUser();
  if (!user) redirect("/login");
  return <TalkClient me={user} />;
}
