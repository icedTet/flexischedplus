import * as React from "react";
import { useUserAuth } from "../hooks/useUserAuth";

function parseQuery(query: string) {
  const result = {} as any;
  query.split("&").forEach((part) => {
    const item = part.split("=");
    result[item[0]] = decodeURIComponent(item[1]);
  });
  return result as { [key: string]: string };
}

export const SuccessfulFSLogin = () => {
  // const user = useUserAuth();
  const query = parseQuery(window.location.search.slice(1));
  const { theme } = query;

  return (
    <div
      className={`w-screen h-screen bg-gray-900 ${theme} flex flex-col justify-center items-center`}
    >
      <div className={`flex flex-col gap-4 max-w-[65ch]`}>
        <span className={`text-white text-4xl font-poppins font-bold`}>
          Flexisched++ is now activated! 🎉
        </span>
        <span className={`text-white text-2xl font-poppins`}>
          You can now use Flexisched++ via the extension on the top right!
        </span>
      </div>
    </div>
  );
};
