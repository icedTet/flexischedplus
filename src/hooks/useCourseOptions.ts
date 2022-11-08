import { useEffect, useState } from "react";
import { ClassesManager, ClassOption } from "../utils/helpers/ClassesManager";

export const useCourseOptions = () => {
  const [courseOptions, setCourseOptions] = useState(
    undefined as null | undefined | ClassOption[]
  );
  useEffect(()=>{
    setCourseOptions(ClassesManager.getInstance().options);
    const updateOptions = (options: ClassOption[]) => {
      setCourseOptions(JSON.parse(JSON.stringify(options)));
    };
    ClassesManager.getInstance().on("coursesUpdate", updateOptions);
    return () => {
      ClassesManager.getInstance().off("coursesUpdate", updateOptions);
    };
  },[])
  return courseOptions;
};
