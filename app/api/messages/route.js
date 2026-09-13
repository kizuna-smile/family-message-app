import { NextResponse } from "next/server";
import { addMessage, listMessages } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { sameOrigin } from "@/lib/auth";

export const runtime="nodejs";
export const dynamic="force-dynamic";
function reply(data,status=200){const r=NextResponse.json(data,{status});r.headers.set("Cache-Control","no-store, private");return r;}

export async function GET(){
  const user=await currentUser();
  if(!user)return reply({error:"ログインが必要です"},401);
  try{return reply({messages:await listMessages()});}
  catch(e){console.error(e);return reply({error:"読み込みに失敗しました"},500);}
}

export async function POST(request){
  if(!sameOrigin(request))return reply({error:"不正なアクセスです"},403);
  const user=await currentUser();
  if(!user)return reply({error:"ログインが必要です"},401);
  let data;try{data=await request.json();}catch{return reply({error:"入力内容を確認してください"},400);}
  const body=typeof data.body==="string"?data.body.trim():"";
  if(!body||body.length>500)return reply({error:"1〜500文字で入力してください"},400);
  try{return reply({message:await addMessage(user.id,body)},201);}
  catch(e){console.error(e);return reply({error:"送信に失敗しました"},500);}
}
