import { NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { sameOrigin } from "@/lib/auth";
import { removePushSubscription, savePushSubscription } from "@/lib/db";
export const runtime="nodejs";
function reply(data,status=200){const r=NextResponse.json(data,{status});r.headers.set("Cache-Control","no-store, private");return r;}
function validSubscription(value){const endpoint=value?.endpoint,keys=value?.keys;return typeof endpoint==="string"&&endpoint.startsWith("https://")&&endpoint.length<=2000&&typeof keys?.p256dh==="string"&&keys.p256dh.length<=300&&typeof keys?.auth==="string"&&keys.auth.length<=300;}
export async function POST(request){if(!sameOrigin(request))return reply({error:"不正なアクセスです"},403);const user=await currentUser();if(!user)return reply({error:"ログインが必要です"},401);let subscription;try{subscription=await request.json();}catch{return reply({error:"通知設定を確認してください"},400);}if(!validSubscription(subscription))return reply({error:"通知設定を確認してください"},400);try{await savePushSubscription(user.id,subscription);return reply({ok:true},201);}catch(error){console.error(error);return reply({error:"通知設定を保存できませんでした"},500);}}
export async function DELETE(request){if(!sameOrigin(request))return reply({error:"不正なアクセスです"},403);const user=await currentUser();if(!user)return reply({error:"ログインが必要です"},401);let data;try{data=await request.json();}catch{return reply({error:"通知設定を確認してください"},400);}if(typeof data?.endpoint!=="string"||data.endpoint.length>2000)return reply({error:"通知設定を確認してください"},400);try{await removePushSubscription(data.endpoint);return reply({ok:true});}catch(error){console.error(error);return reply({error:"通知設定を削除できませんでした"},500);}}
