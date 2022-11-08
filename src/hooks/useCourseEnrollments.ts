import { useEffect, useState } from "react";
import { ClassesManager, ClassOption } from "../utils/helpers/ClassesManager";

export const useCourseEnrollments = () => {
  const [courseEnrollments, setCourseEnrollments] = useState(
    undefined as
      | null
      | undefined
      | {
          default: ClassOption[] | null | undefined;
          enrolled: ClassOption[] | null | undefined;
        }
  );
  useEffect(() => {
    const { default: defaultEnrollments, enrolled: enrolledEnrollments } =
      ClassesManager.getInstance();
    setCourseEnrollments({
      default: defaultEnrollments,
      enrolled: enrolledEnrollments,
    });
    const updateOptions = (options: ClassOption[]) => {
      const { default: defaultEnrollments, enrolled: enrolledEnrollments } =
        ClassesManager.getInstance();
      setCourseEnrollments(
        JSON.parse(
          JSON.stringify({
            default: defaultEnrollments,
            enrolled: enrolledEnrollments,
          })
        )
      );
    };
    ClassesManager.getInstance().on("enrollmentUpdate", updateOptions);
    return () => {
      ClassesManager.getInstance().off("enrollmentUpdate", updateOptions);
    };
  }, []);
  return courseEnrollments;
};
