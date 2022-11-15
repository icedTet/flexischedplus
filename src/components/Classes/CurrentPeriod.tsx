import * as React from "react";
import { useCourseEnrollments } from "../../hooks/useCourseEnrollments";
import { useCourseOptions } from "../../hooks/useCourseOptions";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { ClassesManager } from "../../utils/helpers/ClassesManager";
export const CurrentSchedulingEvent = () => {
  const enrollment = useCourseEnrollments();
  return (
    <div className={`w-full flex flex-col gap-4`}>
      <div className={`w-full flex flex-col gap-1 items-start`}>
        <span
          className={`text-sm font-bold uppercase dark:text-gray-50/40 text-gray-900/40 font-wsans`}
        >
          Event
        </span>

        <div className={`flex flex-col gap-1 w-full`}>
          <span
            className={`text-base dark:text-gray-50 font-wsans w-fit font-bold`}
          >
            {ClassesManager.getInstance().currentEvent}
          </span>
        </div>
      </div>
    </div>
  );
};
