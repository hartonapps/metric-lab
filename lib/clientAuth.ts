import { auth } from "@/lib/firebaseClient";

export async function getIdToken(forceRefresh = false) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  return user.getIdToken(forceRefresh);
}

export async function authedFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {});

  const attachHeaders = async (forceRefresh = false) => {
    const token = await getIdToken(forceRefresh);
    headers.set("Authorization", `Bearer ${token}`);
    if (!headers.has("Content-Type") && init.body) {
      headers.set("Content-Type", "application/json");
    }
  };

  await attachHeaders(false);
  let res = await fetch(input, { ...init, headers });

  if (res.status === 401) {
    await attachHeaders(true);
    res = await fetch(input, { ...init, headers });
  }

  return res;
}