import * as React from "react";
import { ClassOption } from "../../utils/helpers/ClassesManager";
import { UserGroupIcon } from "@heroicons/react/24/outline";
import { useCourseEnrollments } from "../../hooks/useCourseEnrollments";
function htmlDecode(input:string) {
  var doc = new DOMParser().parseFromString(input, "text/html");
  return doc.documentElement.textContent;
}

export const ClassListEntry = (props: { option: ClassOption }) => {
  const { option } = props;
  const enrollment = useCourseEnrollments();
  return (
    <div
      className={`flex flex-row gap-4 w-full border dark:border-gray-600/40 border-gray-400/40 hover:bg-gray-900/10 hover:border-purple-200/60 dark:hover:border-purple-800/60 rounded-2xl p-4 dark:hover:bg-gray-700/20 transition-all duration-300 cursor-pointer ${
        !option.open ? `opacity-50 !cursor-not-allowed` : `group`
      } ${
        enrollment?.enrolled?.find((opt) => opt.teacher.raw === option.teacher.raw)
          ? `!bg-purple-200/20 dark:!bg-purple-800/20`
          : ``
      }`}
    >
      <div
        className={`h-auto w-0 border-2 rounded-full dark:border-gray-700 border-gray-400/40 group-hover:border-purple-400 dark:group-hover:border-purple-600 transition-all duration-200`}
      />
      <div className="flex flex-col items-start gap-0.5 w-full">
        <div className={`flex flex-row w-full justify-between`}>
          <span
            className={`font-bold text-sm dark:text-gray-50/40 font-wsans w-fit`}
          >
            {option.type}
          </span>
          <div
            className={`flex flex-row gap-0.5 items-center text-gray-900/50 dark:text-gray-50/50`}
          >
            {option.limit ? `${option.limit} students` : "N/A students"}
            <UserGroupIcon className={`h-4 w-4`} />
          </div>
        </div>
        <div className={`flex flex-row gap-2 items-center`}>
          <div
            className={`font-bold text-xl dark:text-gray-50 font-poppins w-fit`}
          >
            {option.teacher.first} {option.teacher.last}
            {option.teacher.displayName}
          </div>
          <div
            className={`rounded-full p-1 px-2.5 dark:bg-pink-800 bg-pink-300 shadow-sm`}
          >
            <span
              className={`text-xs font-bold dark:text-gray-100 text-gray-700 uppercase`}
            >
              {option.category}
            </span>
          </div>
        </div>
        <p className={`text-base dark:text-gray-50 font-wsans w-fit`}>
          {htmlDecode(option.description)}
        </p>
        <span className={`text-base dark:text-gray-100/60 text-gray-900/60 font-wsans w-fit flex flex-row gap-1`}>
          {option.restrictions ? <>Group <p className={`dark:text-purple-300 text-purple-800/60 font-bold`}>{option.restrictions}</p> only</> : "No restrictions"}
        </span>
      </div>
    </div>
  );
};
