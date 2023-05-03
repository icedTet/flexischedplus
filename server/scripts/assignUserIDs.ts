import nfetch from "../utils/FixedNodeFetch";
import { getAllEntries, setDataFromID } from "../utils/TokenLib";

export const assignUserIDs = async () => {
  const userDatas = await getAllEntries();
  console.log("Loaded userData", userDatas);
  for (let i = 0; i < userDatas.length; i++) {
    const userData = userDatas[i];
    // console.log("Assigning ID to token", userData);
    const dashbaordReq = await nfetch(userData.dashboardURL, {
      headers: {
        cookie: `flexisched_session_id=${userData.token}`,
      },
    });
    const dashbaordReqText = await dashbaordReq.text();

    const userID = dashbaordReqText.match(/id = '([^']+)'/)?.[1];
    if (!userID) {
      console.log("Invalid token, no userID found");
      continue;
    }
    console.log("Found userID", userID);
    await setDataFromID(userData.id, {
      flexischedUserID: userID,
    });
    // console.log("Assigned ID to token", userData);
    console.log(`Assigned ID to ${i + 1}/${userDatas.length} tokens`);
  }
};
