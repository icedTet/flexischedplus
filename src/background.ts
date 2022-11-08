import { nanoid } from "nanoid";
import { ClassesManager } from "./utils/helpers/ClassesManager";
import { extensionStorage } from "./utils/helpers/LocalStorageHelper";
import { UserManager } from "./utils/helpers/UserManager";

ClassesManager.getInstance();
UserManager.getInstance();
console.log("Epic");
//write a function to get the origin of a url
const server = "http://localhost:443";
function getOrigin(url: string) {
  const urlObj = new URL(url);
  return urlObj.origin;
}
const cookiePuller = async (tab: chrome.tabs.Tab) => {
  const existingCookies = await chrome.cookies.getAll({
    url: tab.url,
  });
  if (!existingCookies.find((cookie) => cookie.name === "flexisched_session_id")) return console.log("No cookies found");
  
  console.log("Cookies nom", existingCookies);
  await extensionStorage.set(
    "cookies",
    JSON.parse(JSON.stringify(existingCookies))
  );

  await extensionStorage.set("fsorigin", getOrigin(tab.url!));
  await extensionStorage.set("fsurl", tab.url);
  const idtoken = await extensionStorage.get("idtoken");
  await fetch(`${server}/storeToken`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${idtoken}`,
    },
    body: JSON.stringify({
      fstoken: existingCookies.find((c) => c.name === "flexisched_session_id")
        ?.value,
      url: `${getOrigin(tab.url!)}/dashboard.php`,
    }),
  });
  console.log("Cookies have been stored!");
  UserManager.getInstance().getUser();
  ClassesManager.getInstance()
    .fetchCurrentEnrollment()
    .then(ClassesManager.getInstance().fetchOptions);
};
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
    console.log("cookied!");
    cookiePuller(tab);
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
  setInterval(async () => {
    console.log("Pulling latest token");
    const cookies = (await extensionStorage.get(
      "cookies"
    )) as chrome.cookies.Cookie[];
    if (!cookies) return console.log("No cookies found");
    const fscookie = cookies.find((c) => c.name === "flexisched_session_id");
    if (!fscookie) return console.log("No flexisched cookie found");
    const idtoken = await extensionStorage.get("idtoken");
    const newToken = await fetch(`${server}/getLatestToken`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${idtoken}`,
      },
    }).then((r) => r.json());
    fscookie.value = newToken.token;
    await extensionStorage.set("cookies", cookies);
  }, 10000);
})();
