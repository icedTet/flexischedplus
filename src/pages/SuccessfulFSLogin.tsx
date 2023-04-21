import * as React from "react";
import { useUserAuth } from "../hooks/useUserAuth";
import ReactConfetti from "react-confetti";
import { useEffect, useState } from "react";

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
  const [pieceCount, setPieceCount] = useState(100);
  const [aniState, setAniState] = useState(0);
  useEffect(() => {
    setTimeout(() => {
      setAniState(1);
    }, 100);
    setTimeout(() => {
      setAniState(2);
    }, 100);
  }, []);
  return (
    <div
      className={`w-screen h-screen  ${
        theme === `dark` ? `bg-gray-900 dark` : `bg-gray-200`
      } flex flex-col justify-center items-center z-0`}
    >
      <ReactConfetti
        width={window.innerWidth}
        height={window.innerHeight}
        confettiSource={{
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
          w: 0,
          h: 0,
        }}
        tweenDuration={500}
        initialVelocityX={{
          min: -20,
          max: 20,
        }}
        gravity={0.05}
        numberOfPieces={pieceCount}
        recycle={false}
        run={aniState >= 1}
      />
      <div className={`relative`}>
        <div
          className={`flex flex-col gap-6 max-w-[65ch] items-center z-20 p-16 dark:bg-gray-800 bg-gray-50 rounded-2xl shadow-purple-300 dark:shadow-md border-2 border-purple-600 ${
            aniState === 0 && `opacity-50 transform scale-0`
          } transition-all duration-300 dark:text-white text-gray-900 relative`}
        >
          <div className="w-32 h-32 mb-4 relative">
            <img
              src={`icon128.png`}
              className={`w-full h-full absolute top-0 left-0 blur-md `}
            />
            <img
              src={`icon128.png`}
              className={`w-full h-full absolute top-0 left-0`}
            />
          </div>
          <span className={` text-4xl font-poppins font-bold leading-loose`}>
            <span
              className={`leading-loose text-transparent bg-clip-text bg-gradient-to-br from-rose-400 via-fuchsia-500 to-indigo-500 font-black text-4xl`}
            >
              Flexisched++
            </span>{" "}
            is now activated! 🎉
          </span>
          <span
            className={` text-2xl font-wsans font-medium dark:text-gray-100 text-gray-500`}
          >
            You can now use the Flexisched++ extension to access your Flexisched
            instance!
          </span>

          <button
            className={`bg-fuchsia-400 rounded-2xl px-6 py-3 hover:bg-fuchsia-600 hover:brightness-110 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed text-white text-xl focus:scale-110 duration-75`}
            onClick={(e) => {
              // window.close();
              setPieceCount(pieceCount + 100);
              setTimeout(() => {
                (e.target as HTMLButtonElement).blur();
              }, 75);
            }}
          >
            Celebrate!
          </button>
          <span
            className={` text-sm font-wsans font-medium dark:text-gray-500 text-gray-400`}
          >
            Feel free to close this window.
          </span>
        </div>
        <div
          className={`absolute top-0 left-0 w-full h-full dark:blur-2xl blur-xl bg-gradient-to-br from-rose-400 via-fuchsia-500 to-indigo-500 animate-pulse ${
            aniState === 0 && `transform scale-0`
          } transition-all duration-500 delay-300 ease-out`}
        />
      </div>
    </div>
  );
};
