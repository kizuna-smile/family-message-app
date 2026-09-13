import { redirect } from "next/navigation";
import { currentUser } from "@/lib/session";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const user = await currentUser();
  if (user) redirect("/talk");
  return (
    <main className="centerPage">
      <section className="card loginCard">
        <div className="appMark">家</div>
        <h1>わが家トーク</h1>
        <p className="muted">家族を選んでログインしてください</p>
        <LoginForm />
      </section>
    </main>
  );
}
