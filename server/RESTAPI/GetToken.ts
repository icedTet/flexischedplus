import { RESTMethods, RESTHandler } from "../server";
import { verifyToken } from "../utils/TetLibMini";
import { getDataFromID } from "../utils/TokenLib";

export const GetToken = {
  path: "/getLatestToken",
  method: RESTMethods.GET,
  run: async (req, res, next) => {
    const token = req.headers.authorization;
    if (!token || !verifyToken(token)) {
      return res.status(401).send("No token provided/invalid token");
    }
    const tokendata = await getDataFromID(token);
    if (!tokendata) {
      return res.status(401).send("Token not found");
    }
    return res.status(200).json(tokendata);
  },
} as RESTHandler;
export default GetToken;
