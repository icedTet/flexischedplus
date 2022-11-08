export type UserData = {
  id: string;
  token: string;
  dashboardURL: string;
  lastPing: number;
};
export const getDataFromID = async (id: string) =>
  MongoDB?.db("FlexiSchedMain")
    .collection("usertokens")
    .findOne({ id }) as Promise<UserData | null>;
export const setDataFromID = async (id: string, data: Partial<UserData>) =>
  MongoDB?.db("FlexiSchedMain")
    .collection("usertokens")
    .updateOne({ id }, { $set: data }, { upsert: true });
export const deleteEntryFromID = async (id: string) =>
  MongoDB?.db("FlexiSchedMain").collection("usertokens").deleteOne({ id });
export const getAllEntries = async () => {
  return (await MongoDB?.db("FlexiSchedMain")
    .collection("usertokens")
    .find({})
    .toArray()) as unknown as Promise<UserData[]>;
};
