import * as React from "react";
import { useUserAuth } from "../hooks/useUserAuth";

export const SuccessfulFSLogin = () => {
  const user = useUserAuth();

  return (
    <div
      className={`w-full h-full bg-gray-900 flex flex-col justify-center items-center`}
    >
      <div className={`flex flex-col gap-4 max-w-[32ch]`}>
        <span className={`text-white text-4xl font-poppins font-bold`}>
          Flexisched++ is now activated! 🎉
        </span>
        <span className={`text-white text-2xl font-poppins`}>
          You can now use Flexisched++ via the extension.
        </span>
      </div>
    </div>
  );
};
