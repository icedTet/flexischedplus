import { EventEmitter } from "events";
let pcache = null as { [key: string]: any } | null;

export class StorageUpdates extends EventEmitter {
  static instance: StorageUpdates;
  static getInstance() {
    if (!StorageUpdates.instance) {
      StorageUpdates.instance = new StorageUpdates();
    }
    return this.instance;
  }
  private constructor() {
    super();
  }
}
export const extensionStorage = {
  getAll: () => {
    return new Promise((resolve, reject) => {
      chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === "local") {
          console.log("Storage changed", changes);
          Object.entries(changes).map(([key, { newValue }]) => {
            pcache![key] = newValue;
            StorageUpdates.getInstance().emit("change", key, newValue);
          });
        }
      });
      chrome.storage.local.get(null, (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(result);
        }
      });
    }) as Promise<Record<string, any>>;
  },
  get: (key: string) => {
    return new Promise(async (resolve, reject) => {
      if (!pcache) {
        pcache = await extensionStorage.getAll();
      }
      console.log("Getting key", key,pcache);
      resolve(pcache[key]);
    }) as Promise<any>;
  },
  set: (key: string, value: any) => {
    return new Promise((resolve, reject) => {
      
      chrome.storage.local.set({ [key]: value }, () => {
        console.log("Storage set", key, value);
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        }
        pcache![key] = value;
        resolve(true);
      });
    }) as Promise<boolean>;
  },
};
