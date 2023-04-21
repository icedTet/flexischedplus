import * as React from "react";
import { useUserAuth } from "../hooks/useUserAuth";
import { MonogramPFP } from "./Monogram";
import { ProfileCard } from "./ProfileCard";

export const UserPFP = () => {
  const user = useUserAuth();
  return (
    <div className={`w-10 h-10 relative z-20`}>
      {!user && (
        <MonogramPFP
          firstName={"?"}
          className={`!text-base w-full h-full animate-ping scale-100`}
        />
      )}
      <MonogramPFP
        firstName={user?.firstName || "?"}
        lastName={user?.lastName}
        className={`!text-base w-full h-full ${
          !user && `absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`
        }`}
      />

      <ProfileCard />
    </div>
  );
};
