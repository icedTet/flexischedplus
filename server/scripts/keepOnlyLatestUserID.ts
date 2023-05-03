import nfetch from "../utils/FixedNodeFetch";
import {
  UserData,
  deleteEntryFromID,
  getAllEntries,
  setDataFromID,
} from "../utils/TokenLib";

let deleted = 0;
export const keepLatestUserIDs = async () => {
  const userDatas = await getAllEntries();
  const fsUserIdMap = new Map<string, UserData[]>();
  for (let i = 0; i < userDatas.length; i++) {
    const userData = userDatas[i];
    if (!userData.flexischedUserID) continue;
    const fsUserDatas = fsUserIdMap.get(userData.flexischedUserID) || [];
    fsUserDatas.push(userData);
    fsUserIdMap.set(userData.flexischedUserID, fsUserDatas);
  }
  // for each user id, keep the latest token
  for (const [fsUserID, fsUserDatas] of fsUserIdMap.entries()) {
    if (fsUserDatas.length <= 1) continue;
    const latestUserData = fsUserDatas.reduce((prev, curr) => {
      if (prev.lastPing < curr.lastPing) return curr;
      return prev;
    });
    // console.log("Latest user data", latestUserData);
    for (const userData of fsUserDatas) {
      if (userData.id === latestUserData.id) continue;
      await deleteEntryFromID(userData.id);
      console.log("Deleted user data", userData, deleted);
      deleted++;
    }
  }
  console.log("Deleted", deleted);
};
