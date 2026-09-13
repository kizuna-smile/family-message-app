import { cookies } from "next/headers";
import { readSessionToken } from "./auth";

export async function currentUser() {
  const store = await cookies();
  const token = store.get("family_session")?.value;
  return readSessionToken(token);
}
