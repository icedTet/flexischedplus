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
//Important!
chrome?.webRequest?.onHeadersReceived.addListener(
  (details) => {
    const cookies = details.responseHeaders?.find(
      (header) => header.name.toLowerCase() === "set-cookie"
    );

    if (details.url?.includes("?norecurse=1")) {
      return;
    }
    // read http-only cookie
    extensionStorage.set("fsorigin", getOrigin(details.url!));
    extensionStorage.set("fsurl", details.url);
    if (!cookies) return;
    const [name, value] = cookies?.value?.split(";")[0].split("=")!;
    cookieHandler({ name, value }, details.url);
  },
  { urls: ["https://*.flexisched.net/dashboard.php"] },
  ["extraHeaders", "responseHeaders"]
);

const cookieHandler = async (
  cookieData: { name: string; value: string },
  url: string
) => {
  const existingCookie = await extensionStorage.get("sesscookie");
  // check if existing cookie is valid.
  if (existingCookie) {
    const nonce1 = nanoid();

    const req = await fetch(
      `${getOrigin(url!)}/dashboard.php?norecurse=1&a=${nonce1}`,
      {
        headers: {
          Cookie: `flexisched_session_id=${existingCookie}`,
        },
        credentials: "include",
      }
    ).then((res) => res.text());
    if (!req.includes("FlexiSCHED Login")) {
      // cookie is valid
      console.log("Cookie is already valid");
      return;
    }
  }
  // check if new cookie is valid
  const nonce = nanoid();
  const ruleID = ~~(Math.random() * 100000);
  // cookie is invalid, validate the new cookie
  const req2 = await fetch(
    `${getOrigin(
      url!
    )}/dashboard.php?norecurse=1&c=${nonce}&dc=${existingCookie}`,
    {
      headers: {
        Cookie: `flexisched_session_id=${cookieData.value}`,
      },
      credentials: "include",
    }
  ).then((res) => res.text());
  if (req2.includes("FlexiSCHED Login")) {
    // new cookie is invalid
    console.log("Invalid cookie, login required");
    return;
  }
  // new cookie is valid
  //save to server
  let idtoken = await extensionStorage.get("idtoken");
  if (!idtoken) {
    // generate a new id token
    idtoken = nanoid(128);
    await extensionStorage.set("idtoken", idtoken);
  }
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
  // get current tab
  await Promise.all([
    UserManager.getInstance().getUser(),
    ClassesManager.getInstance()
      .fetchCurrentEnrollment()
      .then(
        ClassesManager.getInstance().fetchOptions.bind(
          ClassesManager.getInstance()
        )
      ),
  ]);
  console.log("Cookie is valid, saving to server");
  chrome.tabs.create({
    url: `success.html${
      (await extensionStorage.get("theme")) === "dark"
        ? `?theme=dark`
        : `?theme=light`
    }`,
  });

  // announce done!
  // chrome.notifications.create(nanoid(23), {
  //   type: "basic",
  //   iconUrl: "icon64.png",
  //   title: "[Flexisched++] You're All Set!",
  //   message: "You're all set! You can now use Flexisched++",
  //   priority: 2,
  // });
};

// This file is ran as a background script
// when the user visits a site, we want to check if they are logged in
// and if they are, we want to send a message to the content script
// to update the UI
// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//   if (getOrigin(tab.url!).toLowerCase().includes("flexisched")) {
//     // override the page
//     // chrome.tabs.executeScript(tabId, {
//     //   file: "content.js",
//     // });
//     console.log("Flexisched detected");
//     dataSetter(tab);
//   }
//   if (changeInfo.status === "complete") {
//     // chrome.tabs.sendMessage(tabId, { type: "check-login" });
//   }
// });
(async () => {
  const idtoken = await extensionStorage.get("idtoken");
  if (!idtoken) {
    // generate a new id token
    const idtoken = nanoid(128);
    await extensionStorage.set("idtoken", idtoken);
  }
  while (true) {
    console.log("Pulling latest token");
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
