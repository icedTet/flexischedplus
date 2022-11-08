import * as React from "react";
import { useUserAuth } from "../hooks/useUserAuth";
import { MonogramPFP } from "./Monogram";
import { ProfileCard } from "./ProfileCard";

export const UserPFP = () => {
  const user = useUserAuth();
  return (
    <div className={`w-10 h-10 relative z-20`}>
      <MonogramPFP
        firstName={user?.firstName || "?"}
        lastName={user?.lastName}
        className={"!text-base w-full h-full"}
      />
      <ProfileCard />
    </div>
  );
};
