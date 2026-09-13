"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const USERS = [["father","父"],["mother","母"],["son1","長男"],["son2","次男"]];

export default function LoginForm() {
  const [userId,setUserId] = useState("father");
  const [password,setPassword] = useState("");
  const [error,setError] = useState("");
  const [busy,setBusy] = useState(false);
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/login", {
        method:"POST",
        headers:{"content-type":"application/json"},
        body:JSON.stringify({userId,password})
      });
      const data = await res.json().catch(()=>({}));
      if (!res.ok) { setError(data.error || "ログインできませんでした"); return; }
      router.replace("/talk"); router.refresh();
    } catch { setError("通信できませんでした"); }
    finally { setBusy(false); }
  }

  return (
    <form className="loginForm" onSubmit={submit}>
      <label><span>家族</span><select value={userId} onChange={e=>setUserId(e.target.value)}>{USERS.map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label>
      <label><span>パスワード</span><input type="password" value={password} onChange={e=>setPassword(e.target.value)} maxLength={100} required /></label>
      {error && <p className="error" role="alert">{error}</p>}
      <button className="primaryButton" type="submit" disabled={busy}>{busy?"確認中…":"ログイン"}</button>
    </form>
  );
}
