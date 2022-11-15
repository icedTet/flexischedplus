import * as React from "react";
import { useCourseEnrollments } from "../../hooks/useCourseEnrollments";
import { useCourseOptions } from "../../hooks/useCourseOptions";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
export const CurrentSelectedClass = () => {
  const enrollment = useCourseEnrollments();
  return (
    <div className={`w-full flex flex-col gap-4`}>
      <div className={`w-full flex flex-col gap-1 items-start`}>
        <span
          className={`text-sm font-bold uppercase dark:text-gray-50/40 text-gray-900/40 font-wsans`}
        >
          Selected Class
        </span>

        <div className={`flex flex-col gap-1 w-full`}>
          {!enrollment?.enrolled?.length && (
            <div
              className={`flex flex-row gap-2 w-full border dark:border-gray-600/40 border-gray-400/40 rounded-2xl p-4 transition-all duration-300 items-center`}
              key={`enrollment-current-notfound`}
            >
              <ExclamationTriangleIcon
                className={`w-4 h-4 dark:text-gray-50 flex-shrink-0`}
              />
              <span
                className={`text-base dark:text-gray-50 font-poppins w-fit font-bold`}
              >
                No Class Selected
              </span>
            </div>
          )}
          {enrollment?.enrolled?.map((enrollment, index) => (
            <div
              className={`flex flex-col gap-2 w-full border dark:border-gray-600/40 border-gray-400/40 rounded-2xl p-4 transition-all duration-300`}
              key={`enrollment-${index}-${enrollment.teacher.raw}`}
            >
              <span
                className={`text-lg dark:text-gray-50 font-poppins w-fit font-bold`}
              >
                {enrollment.teacher.first} {enrollment.teacher.last}{" "}
                {enrollment.teacher.displayName}
              </span>
              <div className={`flex flex-row justify-end w-full`}>
                <button
                  className={`dark:bg-fuchsia-600 px-3 py-1.5 text-sm text-gray-50 rounded-full dark:hover:bg-fuchsia-700 bg-fuchsia-400 hover:bg-fuchsia-300 transition-all duration-200 opacity-25`}
                >
                  Set as default (WIP)
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
