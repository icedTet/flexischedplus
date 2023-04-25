export type User = {
  // id: string;
  firstName: string;
  lastName: string;
  groups?: string[];
  // email: string;
  // fsauth: string;
};
export type UserDataClient = {
  id: string;
  token: string;
  dashboardURL: string;
  lastPing: number;
  preferredClass?: string;
};
