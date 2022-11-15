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
  const cookie = (await extensionStorage.get("sesscookie")) as string;
  const flexicookieURL = await extensionStorage.get("fsurl");
  const existingCookies = await chrome.cookies.getAll({
    url: flexicookieURL,
  });
  const origin = await extensionStorage.get("fsorigin");
  return await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
      ...(withAuth && cookie
        ? {
            Cookie: `flexisched_session_id=${cookie}`,
          }
        : {}),
    },
  });

  //   console.log('Requesting', input, btype, requestBuckets))
};
