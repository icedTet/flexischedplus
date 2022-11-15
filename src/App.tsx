import { Switch } from "@headlessui/react";
import * as React from "react";
import { ClassList } from "./components/Classes/ClassList";
import { CurrentSchedulingEvent } from "./components/Classes/CurrentPeriod";
import { CurrentSelectedClass } from "./components/Classes/CurrentSelectedClass";
import { DefaultSelectedClass } from "./components/Classes/DefaultSelectedClass";
import { MonogramPFP } from "./components/Monogram";
import { ProfileCard } from "./components/ProfileCard";
import { UserPFP } from "./components/UserPFP";
import { useDarkMode } from "./hooks/useDarkMode";
import { useUserAuth } from "./hooks/useUserAuth";
import logo from "./logo.svg";
import { extensionStorage } from "./utils/helpers/LocalStorageHelper";

const App = () => {
  const { theme, setChangeTheme } = useDarkMode();
  const userInfo = useUserAuth();
  return (
    <div className={theme} id={"base"}>
      <div
        className={`dark:bg-gray-800 bg-gray-100 w-extension h-extension flex flex-col gap-4 p-8 pb-0 transition-all duration-300`}
      >
        <div
          className={`flex flex-row gap-4 items-center justify-between w-full`}
        >
          <div
            className={`flex flex-row gap-2 items-center justify-start flex-shrink-0 group`}
          >
            <UserPFP />
            <div
              className={`font-poppins font-bold text-base bg-gradient-to-tr dark:from-pink-300 dark:via-purple-300 dark:to-indigo-400 from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent`}
            >
              Flexisched++
            </div>
          </div>
          <Switch.Group
            as="div"
            className="flex items-center space-x-4 cursor-pointer"
          >
            <Switch
              checked={theme === "dark"}
              onChange={(c: boolean) => {
                console.log(c);
                extensionStorage
                  .set("theme", c ? "dark" : "light")
                  .then(() => setChangeTheme(true));
              }}
              className={`${
                theme === "dark"
                  ? "bg-gradient-to-r from-purple-600 to-pink-500 via-fuchsia-500"
                  : "bg-gray-200"
              } relative inline-flex h-6 w-11 items-center rounded-full shadow-md`}
            >
              <span className="sr-only">Dark Mode</span>
              <span
                className={`${
                  theme === "dark" ? "translate-x-6" : "translate-x-1"
                } inline-block h-4 w-4 transform rounded-full bg-white transition`}
              />
            </Switch>
            <Switch.Label className={`text-sm font-wsans dark:text-gray-200`}>
              Enable Dark Mode
            </Switch.Label>
          </Switch.Group>
        </div>
        {userInfo ? (
          <div className={`flex flex-row flex-grow w-full gap-4`}>
            <div className={`flex flex-row justify-start items-start h-full`}>
              <ClassList />
            </div>
            <div
              className={`flex-grow flex flex-col gap-4 h-full justify-start`}
            >
              <CurrentSchedulingEvent />
              <CurrentSelectedClass />
              <DefaultSelectedClass />
            </div>
          </div>
        ) : (
          <div
            className={`flex flex-row flex-grow w-full justify-center items-center`}
          >
            <div
              className={`flex flex-col gap-4 justify-center items-center h-full text-lg font-bold dark:text-gray-100 max-w-[50vw]`}
            >
              Hover over the{" "}
              <MonogramPFP firstName={"?"} className={"!text-base w-10 h-10"} />{" "}
              icon in the top left corner of the extension and authenticate
              FlexiSched to get started!
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
