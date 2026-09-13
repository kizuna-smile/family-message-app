"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const NAMES={father:"父",mother:"母",son1:"長男",son2:"次男"};
function fmt(v){try{return new Intl.DateTimeFormat("ja-JP",{month:"numeric",day:"numeric",hour:"2-digit",minute:"2-digit"}).format(new Date(v));}catch{return "";}}

export default function TalkClient({me}){
  const [messages,setMessages]=useState([]),[text,setText]=useState(""),[error,setError]=useState(""),[sending,setSending]=useState(false),[loading,setLoading]=useState(true);
  const bottomRef=useRef(null); const router=useRouter();
  const load=useCallback(async(quiet=false)=>{try{const res=await fetch("/api/messages",{cache:"no-store"});if(res.status===401){router.replace("/login");return;}if(!res.ok)throw new Error();const data=await res.json();setMessages(data.messages||[]);if(!quiet)setError("");}catch{if(!quiet)setError("メッセージを読み込めませんでした");}finally{if(!quiet)setLoading(false);}},[router]);
  useEffect(()=>{load();const t=setInterval(()=>load(true),5000);return()=>clearInterval(t);},[load]);
  useEffect(()=>{if(!loading)bottomRef.current?.scrollIntoView();},[loading]);
  async function send(e){e.preventDefault();const body=text.trim();if(!body||sending)return;setSending(true);setError("");try{const res=await fetch("/api/messages",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({body})});if(res.status===401){router.replace("/login");return;}const data=await res.json().catch(()=>({}));if(!res.ok){setError(data.error||"送信できませんでした");return;}setText("");await load(true);setTimeout(()=>bottomRef.current?.scrollIntoView(),0);}catch{setError("送信できませんでした");}finally{setSending(false);}}
  return <main className="talkPage"><header className="talkHeader"><div><h1>わが家トーク</h1><p>{me.name} としてログイン中</p></div></header><section className="messages" aria-live="polite">{loading&&<p className="status">読み込み中…</p>}{!loading&&messages.length===0&&<div className="empty"><p>まだメッセージはありません。</p><p>最初のひとことを送ってみましょう。</p></div>}{messages.map(m=>{const mine=m.user_id===me.id;return <article className={`messageRow ${mine?"mine":""}`} key={m.id}><div className="messageMeta"><strong>{NAMES[m.user_id]||"家族"}</strong><time>{fmt(m.created_at)}</time></div><div className="bubble">{m.body}</div></article>;})}<div ref={bottomRef}/></section><footer className="composerWrap">{error&&<p className="composerError">{error}</p>}<form className="composer" onSubmit={send}><textarea value={text} onChange={e=>setText(e.target.value)} placeholder="メッセージを入力" maxLength={500} rows={1}/><button type="submit" disabled={sending||!text.trim()}>{sending?"…":"送信"}</button></form><div className="count">{text.length}/500</div></footer></main>;
}
