import Fuse from "fuse.js";
import * as React from "react";
import { useEffect } from "react";
import { useCourseOptions } from "../../hooks/useCourseOptions";
import { ClassOption } from "../../utils/helpers/ClassesManager";
import { ClassListEntry } from "./ClassListEntry";

export const ClassList = () => {
  const classes = useCourseOptions();
  const [search, setSearch] = React.useState("");
  const [filteredClasses, setFilteredClasses] = React.useState(
    [] as ClassOption[]
  );
  useEffect(() => {
    if (!classes) return;
    if (search === "") {
      setFilteredClasses(classes);
    } else {
      const fuser = new Fuse(classes, {
        keys: [
          "type",
          "description",
          "restrictions",
          "category",
          "teacher.first",
          "teacher.last",
          "teacher.displayName",
          "teacher.raw",
          "room",
        ],
      });

      setFilteredClasses(fuser.search(search).map((res) => res.item));
    }
  }, [classes, search]);
  return (
    <div className={`w-[65ch] h-full flex flex-col gap-1`}>
      <span
        className={`font-bold text-sm uppercase dark:text-gray-100/40 text-gray-900/40 font-wsans`}
      >
        Classes (
        {classes?.length && search.length
          ? filteredClasses.length
          : classes?.length}
        )
      </span>
      <input
        type="text"
        placeholder="Search"
        className={`w-full h-12 dark:bg-gray-800 shadow-inner border dark:border-gray-100/20 !outline-none focus:ring-1 dark:focus:bg-gray-850 dark:ring-gray-100/20 rounded-xl px-4 dark:text-gray-100 font-wsans text-lg transition-all duration-300`}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className={`w-[65ch] relative h-full`}>
        <div
          className={`flex flex-col gap-4 absolute top-0 left-0 w-full h-full overflow-auto py-4 scrollbar-hide`}
        >
          <div className={`flex flex-col gap-2.5 w-full`}>
            {!filteredClasses.length &&
              !!classes?.length &&
              !!search.length && (
                <span
                  className={`text-gray-900/40 dark:text-gray-100/40 font-wsans text-sm`}
                >
                  No results found
                </span>
              )}
            {!filteredClasses.length && !classes?.length && (
              <span
                className={`text-gray-900/40 dark:text-gray-100/40 font-wsans text-sm`}
              >
                Fetching Classes...
              </span>
            )}
            {!!filteredClasses.length &&
              filteredClasses.map((option, index) => (
                <ClassListEntry
                  key={`class-list-entry-${index}`}
                  option={option}
                />
              ))}
            {!filteredClasses.length &&
              !!classes?.length &&
              !search.length &&
              classes?.map((option, index) => (
                <ClassListEntry
                  key={`class-list-entry-${index}`}
                  option={option}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
