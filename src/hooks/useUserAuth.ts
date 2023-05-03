import { useEffect, useState } from "react";
import {
  extensionStorage,
} from "../utils/helpers/LocalStorageHelper";
import { UserManager } from "../utils/helpers/UserManager";
import { User } from "../utils/types";

export const useUserAuth = () => {
  const [userAuth, setuserAuth] = useState(
    undefined as null | undefined | User
  );
  useEffect(() => {
    setuserAuth(UserManager.getInstance().user);
    const updateUser = (user: User | null) => {
      setuserAuth(JSON.parse(JSON.stringify(user)));
    };
    UserManager.getInstance().on("user", updateUser);
    return () => {
      UserManager.getInstance().off("user", updateUser);
    };
  }, []);
  return userAuth;
};
