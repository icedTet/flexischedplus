import { useState, useEffect, useLayoutEffect } from "react";
import { extensionStorage } from "../utils/helpers/LocalStorageHelper";
export const useDarkMode = () => {
  const [theme, setTheme] = useState("dark");
  const [changeTheme, setChangeTheme] = useState(false);
  useEffect(() => {
    console.log("useEffect ctheme", changeTheme);
    if (!changeTheme) return;
    (async () => {
      console.log("getting theme", theme);
      const localTheme = await extensionStorage.get("theme");

      console.log("Setting theme to", localTheme);
      if (localTheme) {
        setTheme(localTheme);
      }
      setChangeTheme(false);
    })();
  }, [changeTheme]);
  useLayoutEffect(() => {
    extensionStorage.get("theme").then((localTheme) => {
      console.log("Setting theme to", localTheme);
      setTheme(localTheme);
    });
  }, []);

  return { theme, setChangeTheme };
};
