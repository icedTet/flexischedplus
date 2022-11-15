import { nanoid } from "nanoid";
import { ClassesManager } from "./utils/helpers/ClassesManager";
import { extensionStorage } from "./utils/helpers/LocalStorageHelper";
import { UserManager } from "./utils/helpers/UserManager";

ClassesManager.getInstance();
UserManager.getInstance();
console.log("Epic");
//write a function to get the origin of a url
const server = "https://api.flexischedplus.tet.moe";
function getOrigin(url: string) {
  try {
    const urlObj = new URL(url);
    return urlObj.origin;
  } catch (error) {
    console.warn("Invalid URL", url, error);
    return "";
  }
}

const dataSetter = async (tab: chrome.tabs.Tab) => {
  const url = tab.url!;
  await extensionStorage.set("fsorigin", getOrigin(url!));
  await extensionStorage.set("fsurl", url);

  // delete the cookies
};
const toggleCookieBlocker = async (on: boolean) => {
  if (on) {
    console.log(
      "Cookie blocker is toggling on",
      chrome.declarativeNetRequest.updateDynamicRules
    );
    return chrome.declarativeNetRequest
      .updateDynamicRules({
        addRules: [
          {
            id: 1,
            priority: 1,
            action: {
              type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
              responseHeaders: [
                {
                  header: "set-cookie",
                  operation:
                    chrome.declarativeNetRequest.HeaderOperation.APPEND,
                  value: "; Max-Age=0",
                },
              ],
            },
            condition: {
              urlFilter: "*://*.flexisched.net/*",
            },
          },
        ],
      })
      .catch((e) => console.warn(e));
  }
  console.log(
    "Cookie blocker is going dark",
    chrome.declarativeNetRequest.updateDynamicRules
  );
  chrome.declarativeNetRequest
    .updateDynamicRules({
      removeRuleIds: [1],
    })
    .catch((e) => console.warn(e));
};
let lastBlocked = 0;
const cookieHandler = async (
  cookieData: { name: string; value: string },
  url: string
) => {
  if (lastBlocked > Date.now() - 1000 * 5) return;
  console.log("Cookie handler", cookieData);
  // check if current cookie exists and is valid
  const existingCookie = await extensionStorage.get("sesscookie");
  if (existingCookie) {
    let ruleID = ~~(Math.random() * 100000);
    const nonce1 = nanoid();
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
                value: `flexisched_session_id=${existingCookie}`,
              },
              {
                header: "dummi1",
                operation: chrome.declarativeNetRequest.HeaderOperation.SET,
                value: "dummi",
              },
            ],
          },
          condition: {
            urlFilter: `*://*.flexisched.net/*&a=${nonce1}`,
          },
        },
      ],
    });

    const req = await fetch(
      `${getOrigin(url!)}/dashboard.php?norecurse=1&a=${nonce1}`,
      {
        headers: {
          // Cookie: `flexisched_session_id=${existingCookie}`,
        },
        credentials: "include",
      }
    ).then((res) => res.text());
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [ruleID],
    });
    if (!req.includes("FlexiSCHED Login")) {
      // cookie is valid
      console.log("Cookie is already valid");
      toggleCookieBlocker(true);
      return;
    }
  }

  const nonce = nanoid();
  const ruleID = ~~(Math.random() * 100000);
  // cookie is invalid, validate the new cookie
  await chrome.declarativeNetRequest.updateDynamicRules({
    addRules: [
      {
        id: ruleID,
        priority: 1000,
        action: {
          type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
          requestHeaders: [
            {
              header: "cookie",
              operation: chrome.declarativeNetRequest.HeaderOperation.SET,
              value: `flexisched_session_id=${cookieData.value}`,
            },
            {
              header: "dummi69",
              operation: chrome.declarativeNetRequest.HeaderOperation.SET,
              value: `${JSON.stringify(cookieData)}`,
            },
          ],
        },
        condition: {
          urlFilter: `*:\/\/*.flexisched.net/*&c=${nonce}`,
        },
      },
    ],
  });
  const req2 = await fetch(
    `${getOrigin(url!)}/dashboard.php?norecurse=1&c=${nonce}`,
    {
      headers: {
        // Cookie: `flexisched_session_id=${cookieData.value}`,
      },
      credentials: "include",
    }
  ).then((res) => res.text());
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [ruleID],
  });
  if (req2.includes("FlexiSCHED Login")) {
    // new cookie is invalid
    toggleCookieBlocker(false);
    console.log("Invalid cookie, login required");
    return;
  }
  // new cookie is valid
  //save to server
  const idtoken = await extensionStorage.get("idtoken");

  await fetch(`${server}/storeToken`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${idtoken}`,
    },
    body: JSON.stringify({
      fstoken: cookieData.value,
      url: `${getOrigin(url!)}/dashboard.php`,
    }),
  });
  lastBlocked = Date.now();
  console.log("Cookies have been stored!");
  const prom = toggleCookieBlocker(true).catch((er) =>
    console.warn("cookieerror", er)
  );
  // get current tab
  const currentTab = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  if (currentTab[0].url?.includes(`flexisched`)) {
    chrome.extension.getURL("success.html");
    chrome.tabs.update(currentTab[0].id!, {
      url: chrome.extension.getURL("success.html"),
    });
  }
  await prom;
  UserManager.getInstance().getUser();
  ClassesManager.getInstance()
    .fetchCurrentEnrollment()
    .then(ClassesManager.getInstance().fetchOptions);
};
chrome?.webRequest?.onHeadersReceived.addListener(
  (details) => {
    const cookies = details.responseHeaders?.find(
      (header) => header.name.toLowerCase() === "set-cookie"
    );
    if (details.url.includes("?norecurse=1")) {
      return;
    }
    if (!cookies) return;
    const [name, value] = cookies?.value?.split(";")[0].split("=")!;
    cookieHandler({ name, value }, details.url);
  },
  { urls: ["*://*.flexisched.net/*"] },
  ["extraHeaders", "responseHeaders"]
);

// This file is ran as a background script
// when the user visits a site, we want to check if they are logged in
// and if they are, we want to send a message to the content script
// to update the UI
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (getOrigin(tab.url!).toLowerCase().includes("flexisched")) {
    // override the page
    // chrome.tabs.executeScript(tabId, {
    //   file: "content.js",
    // });
    console.log("Flexisched detected");
    dataSetter(tab);
  }
  if (changeInfo.status === "complete") {
    // chrome.tabs.sendMessage(tabId, { type: "check-login" });
  }
});
(async () => {
  const idtoken = await extensionStorage.get("idtoken");
  if (!idtoken) {
    // generate a new id token
    const idtoken = nanoid(128);
    await extensionStorage.set("idtoken", idtoken);
  }
  while (true) {
    console.log("Pulling latest token");
    // const cookie = (await extensionStorage.get("sesscookie")) as
    //   | string
    //   | undefined;
    // if (!cookie) {
    //   console.log("No cookie found", await extensionStorage.getAll());
    //   await new Promise((r) => setTimeout(r, 1000 * 4));
    //   continue;
    // }
    try {
      const idtoken = await extensionStorage.get("idtoken");
      const newToken = await fetch(`${server}/getLatestToken`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${idtoken}`,
        },
      })
        .then((r) => r.json())
        .catch((er) => console.warn(er));
      if (newToken.token)
        await extensionStorage.set("sesscookie", newToken.token);
      console.log("Updated token");
      try {
        await ClassesManager.getInstance().fetchCurrentEnrollment();
        await ClassesManager.getInstance().fetchOptions();
        await UserManager.getInstance().getUser();
      } catch (error) {
        console.log("Error fetching data", error);
      }

      await new Promise((r) => setTimeout(r, 1000 * 10));
    } catch (error) {
      console.warn("Error pulling latest token", error);
      await new Promise((r) => setTimeout(r, 1000 * 4));
    }
  }
})();
toggleCookieBlocker(false);
