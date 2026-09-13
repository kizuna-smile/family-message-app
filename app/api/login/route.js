import { NextResponse } from "next/server";
import { clientIp, createSessionToken, getUser, sameOrigin, verifyPassword } from "@/lib/auth";
import { clearLoginAttempts, loginRateAllowed } from "@/lib/db";

export const runtime="nodejs";
export async function POST(request){
  if(!sameOrigin(request))return NextResponse.json({error:"不正なアクセスです"},{status:403});
  let data;try{data=await request.json();}catch{return NextResponse.json({error:"入力内容を確認してください"},{status:400});}
  const userId=typeof data.userId==="string"?data.userId:"";
  const password=typeof data.password==="string"?data.password:"";
  if(!getUser(userId)||password.length<1||password.length>100)return NextResponse.json({error:"家族名またはパスワードが違います"},{status:401});
  const key=`${clientIp(request)}:${userId}`;
  if(!(await loginRateAllowed(key)))return NextResponse.json({error:"ログイン試行が多すぎます。しばらくしてからお試しください。"},{status:429});
  if(!verifyPassword(userId,password))return NextResponse.json({error:"家族名またはパスワードが違います"},{status:401});
  await clearLoginAttempts(key);
  const res=NextResponse.json({ok:true});
  res.cookies.set("family_session",createSessionToken(userId),{httpOnly:true,sameSite:"strict",secure:process.env.NODE_ENV==="production",path:"/",maxAge:604800});
  res.headers.set("Cache-Control","no-store");
  return res;
}
