// This file is injected as a content script
console.log("Hello from content script!");
if (!document.location.origin.toLowerCase().includes("flexisched")) {
  //@ts-ignore
  return false;
}
console.log("Flexisched detected");