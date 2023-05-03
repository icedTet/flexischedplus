type UserDataClient = {
  id: string;
  token: string;
  dashboardURL: string;
  lastPing: number;
  preferredClass?: string;
};
import { ClassesManager } from "./ClassesManager";
import { extensionStorage } from "./LocalStorageHelper";
import { UserManager } from "./UserManager";
const server = "https://api.flexischedplus.tet.moe";
export const MapToObj = <T>(map: Map<string, T>): { [key: string]: T } => {
  const obj: { [key: string]: T } = {};
  map.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
};
export const ObjToMap = <T>(obj: { [key: string]: T }): Map<string, T> => {
  const map = new Map<string, T>();
  Object.entries(obj).forEach(([key, value]) => {
    map.set(key, value);
  });
  return map;
};
export const refreshToken = async () => {
  try {
    const idtoken = await extensionStorage.get("idtoken");
    const newTokenReq = await fetch(`${server}/getLatestToken`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${idtoken}`,
      },
    });
    // .then((r) => r.ok ? r.json() as Promise<UserDataClient> )
    // .catch((er) => console.warn(er));
    const newToken = newTokenReq.ok
      ? ((await newTokenReq.json()) as UserDataClient)
      : null;
    if (!newToken) {
      if (newTokenReq.status === 401) {
        // token invalid
        await extensionStorage.clear();
        
        globalThis?.window?.location?.reload();
        return;
      }
    }
    if (newToken && newToken.token)
      await extensionStorage.set("sesscookie", newToken.token);
    console.log("Updated token");

    try {
      await ClassesManager.getInstance().fetchCurrentEnrollment();
      await ClassesManager.getInstance().fetchOptions();
      await UserManager.getInstance().getUser();
      if (newToken && newToken.preferredClass) {
        await extensionStorage.set("preferredClass", newToken.preferredClass);
      }
    } catch (error) {
      console.log("Error fetching data", error);
    }
  } catch (error) {
    console.warn("Error pulling latest token", error);
  }
};
