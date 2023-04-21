// This file is injected as a content script
console.log("Hello from content script!");
if (!document.location.origin.toLowerCase().match(/https?:\/\/[a-zA-Z0-9-]+\.flexisched\.net/)) {
  //@ts-ignore
  return false;
}
console.log("Flexisched detected",{
  cookie: document.cookie
});
// read cookie info? 
