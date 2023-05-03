import { nanoid } from "nanoid";
import { extensionStorage } from "./LocalStorageHelper";
const server = "https://api.flexischedplus.tet.moe";
export const fetcher = async (
  input: RequestInfo,
  init?: RequestInit | undefined,
  withAuth = true
) => {
  //   console.log('[fetcher]', input, init, btype))
  const ruleID = ~~(Math.random() * 10000000);
  const nonce = nanoid();
  const idtoken = (await extensionStorage.get("idtoken", true)) as string;

  const url = new URL(input as string);
  url.searchParams.set("b", nonce);
  let res = await fetch(`${server}/flexiRequest${url.pathname}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
      ...(withAuth && idtoken
        ? {
            Authorization: `${idtoken}`,
          }
        : {}),
    },
  });
  return res;

  //   console.log('Requesting', input, btype, requestBuckets))
};
