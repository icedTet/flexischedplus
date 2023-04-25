import { RESTHandler, RESTMethods } from "../server";
import nfetch from "../utils/FixedNodeFetch";
import { verifyToken } from "../utils/TetLibMini";
import { getDataFromID, setDataFromID } from "../utils/TokenLib";

export const AutoScheduleClass = {
  path: "/autoSchedule/",
  method: RESTMethods.POST,
  run: async (req, res, next) => {
    const token = req.headers.authorization;
    if (!token || !verifyToken(token)) {
      return res.status(401).send("No token provided/invalid token");
    }
    const tokendata = await getDataFromID(token);
    if (!tokendata) {
      return res.status(401).send("Token not found");
    }
    const set = await setDataFromID(token, {
      preferredClass: req.body.preferredClass,
    });
    if (set?.acknowledged) {
      res
        .status(200)
        .send(
          "Flexisched++ will now automatically attempt to schedule you for this class."
        );
    } else {
      res.status(500).send("Error setting preferred class");
    }
  },
} as RESTHandler;
export default AutoScheduleClass;
