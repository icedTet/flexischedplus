import * as React from "react";
import { useUserAuth } from "../hooks/useUserAuth";
export const GroupProfileCardList = () => {
  const user = useUserAuth();
  if (user) {
    return (
      <div className={`w-full flex flex-col gap-0.5`}>
        <span className={`text-xs font-bold uppercase dark:text-gray-50/40 text-gray-900/40`}>
          Groups
        </span>
        <div className={`flex flex-row gap-0.5 items-center`}>
          {user.groups?.map((group, index) => (
            <GroupProfileCardChip key={`group-chip-${group}`} group={group} />
          ))}
        </div>
      </div>
    );
  }
  return null;
};
export const GroupProfileCardChip = (props: { group: string }) => {
  const { group } = props;
  return (
    <div className={`rounded-full p-1 px-2.5 dark:bg-purple-800 bg-purple-100 shadow-md`}>
      <span className={`text-xs font-bold dark:text-gray-100 text-gray-700 uppercase`}>{group}</span>
    </div>
  );
};
