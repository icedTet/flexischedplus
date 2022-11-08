import { ClassesManager } from "./utils/helpers/ClassesManager";
import { extensionStorage } from "./utils/helpers/LocalStorageHelper";
import { UserManager } from "./utils/helpers/UserManager";

ClassesManager.getInstance();
UserManager.getInstance();
console.log("Epic");
//write a function to get the origin of a url
function getOrigin(url: string) {
  const urlObj = new URL(url);
  return urlObj.origin;
}
const cookiePuller = async (tab: chrome.tabs.Tab) => {
  const existingCookies = await chrome.cookies.getAll({
    url: tab.url,
  });
  console.log("Cookies nom", existingCookies);
  await extensionStorage.set(
    "cookies",
    JSON.parse(JSON.stringify(existingCookies))
  );
  await extensionStorage.set("fsorigin", getOrigin(tab.url!));
  await extensionStorage.set("fsurl", tab.url);

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