import { extensionStorage } from "./LocalStorageHelper";

const cookieFormatter = (cookieArr: chrome.cookies.Cookie[]) =>
  cookieArr
    .map(
      (cookie) =>
        `${encodeURIComponent(cookie.name)}=${encodeURIComponent(cookie.value)}`
    )
    .join("; ");
export const fetcher = async (
  input: RequestInfo,
  init?: RequestInit | undefined,
  withAuth = true
) => {
  //   console.log('[fetcher]', input, init, btype))
  let cookies = null as null | chrome.cookies.Cookie[];
  if (withAuth) {
    cookies = (await extensionStorage.get("cookies")) ?? null;
  }
  return await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
      ...(withAuth && cookies
        ? {
            Cookie: cookieFormatter(cookies),
          }
        : {}),
    },
  });
  //   console.log('Requesting', input, btype, requestBuckets))
};
