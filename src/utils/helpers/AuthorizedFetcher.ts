import { nanoid } from "nanoid";
import { extensionStorage } from "./LocalStorageHelper";
export const fetcher = async (
  input: RequestInfo,
  init?: RequestInit | undefined,
  withAuth = true
) => {
  //   console.log('[fetcher]', input, init, btype))
  const ruleID = ~~(Math.random() * 10000000);
  const nonce = nanoid();
  const cookie = (await extensionStorage.get("sesscookie")) as string;
  await chrome.declarativeNetRequest.updateDynamicRules({
    addRules: [
      {
        id: ruleID,
        priority: 1,
        action: {
          type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
          requestHeaders: [
            {
              header: "cookie",
              operation: chrome.declarativeNetRequest.HeaderOperation.SET,
              value: `flexisched_session_id=${cookie}`,
            },
            {
              header: "dummi",
              operation: chrome.declarativeNetRequest.HeaderOperation.SET,
              value: "dummi",
            },
          ],
        },
        condition: {
          urlFilter: `*://*.flexisched.net/*b=${nonce}`,
        },
      },
    ],
  });

  const url = new URL(input as string);
  url.searchParams.set("b", nonce);
  let res = await fetch(url.toString(), {
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
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [ruleID],
  });
  return res;

  //   console.log('Requesting', input, btype, requestBuckets))
};
