import * as EventEmitter from "events";
import { extensionStorage } from "./LocalStorageHelper";
import { Cheerio, load as cload } from "cheerio";
export type ClassOption = {
  type: string;
  description: string;
  restrictions: string;
  category: string;
  teacher: {
    first?: string;
    last?: string;
    displayName?: string;
    raw: string;
  };
  room?: string;
  limit?: number;
  open?: boolean;
};
import { Element } from "domhandler";
import { fetcher } from "./AuthorizedFetcher";
import { MapToObj, ObjToMap } from "./MiniTetLib";

export class ClassesManager extends EventEmitter {
  static instance: ClassesManager;
  static getInstance() {
    if (!ClassesManager.instance) {
      ClassesManager.instance = new ClassesManager();
    }
    return ClassesManager.instance;
  }
  private constructor() {
    super();
    this.loadCached();
    this.fetchOptions().then(() => {
      this.fetchCurrentEnrollment();
    });
  }
  options: ClassOption[] | null | undefined;
  optionMap: Map<string, ClassOption[]> | null | undefined;
  enrolled: ClassOption[] | null | undefined;
  default: ClassOption[] | null | undefined;
  async loadCached() {
    const cached = await extensionStorage.get("cachedPRIMES");
    const cachedMap = await extensionStorage.get("cachedPRIMESMap");
    const cachedEnrollment = await extensionStorage.get("cachedEnrollment");
    if (cached) {
      this.options = cached;
      this.emit("coursesUpdate", cached);
    }
    if (cachedMap) this.optionMap = ObjToMap(cachedMap);
    if (cachedEnrollment) {
      this.enrolled = cachedEnrollment?.enrolled;
      this.default = cachedEnrollment?.default;
      this.emit("enrollmentUpdate", {
        default: cachedEnrollment?.default,
        enrolled: cachedEnrollment?.enrolled,
      });
    }
  }
  async fetchOptions() {
    const origin = await extensionStorage.get("fsorigin");

    const rawhtml = await fetcher(`${origin}/dashboard.php`).then((res) =>
      res.text()
    );
    const tabledata = cload(rawhtml, {
      withEndIndices: true,
      withStartIndices: true,
    });
    // grab all rows from the table
    const rowdata = tabledata("#results tbody");
    // console.log(rowdata);
    // console.log("zero", rowdata[0]);
    // console.log(rowdata.children().length);
    const classes = [] as ClassOption[];
    const rdchildren = rowdata.children();
    this.optionMap = this.optionMap || new Map();
    for (let i = 0; i < rdchildren.length; i++) {
      const row = rdchildren.eq(i);
      const parsed = ClassesManager.parseOption(row);
      this.optionMap?.set(
        parsed.teacher.raw,
        [parsed]
        // Array.from(
        //   new Set(
        //     [...(this.optionMap?.get(parsed.teacher.raw) ?? []), parsed].map(
        //       (o) => JSON.stringify(o)
        //     )
        //   )
        // ).map((s) => JSON.parse(s) as ClassOption)
      );
      classes.push(parsed);
    }

    // const rows = rowdata.map((r) =>
    //   ClassesManager.parseOption(r as Element)
    // );
    this.options = classes;
    extensionStorage.set("cachedPRIMES", classes);
    extensionStorage.set("cachedPRIMESMap", MapToObj(this.optionMap));
    this.emit("coursesUpdate", classes);
    return classes;
    // console.log(this.options);
  }
  async fetchCurrentEnrollment() {
    const origin = await extensionStorage.get("fsorigin");
    const response = (await fetcher(
      `${origin}/getMasterSchedule.php?_=${Date.now()}`
    ).then((res) =>
      res.ok ? res.json().then((data) => data.data[0][0]) : null
    )) as string | null;
    const defaultClassID = response?.match(/(?:Default: )([^<]+)/)?.[1];
    const enrolledID = response?.match(/(?:Live: )([^<]+)/)?.[1];
    const defaultClass = this.optionMap?.get(defaultClassID!);
    const enrolledClass = this.optionMap?.get(enrolledID!);
    this.default = defaultClass;
    this.enrolled = enrolledClass;
    // cache enrollment
    console.log("enrollment", defaultClass, enrolledClass);
    extensionStorage.set("cachedEnrollment", {
      default: defaultClass,
      enrolled: enrolledClass,
    });
    this.emit("enrollmentUpdate", {
      default: defaultClass,
      enrolled: enrolledClass,
    });
    return { default: defaultClass, enrolled: enrolledClass };
  }
  static parseOption(opt: Cheerio<Element>) {
    // console.log(opt.children().eq(0), opt.html());
    const teacher = opt.children().eq(0).text();
    const email = opt.children().eq(1).text(); //ignore; not needed
    const category = opt.children().eq(2).text();
    const rawDesc = opt.children().eq(3).html(); // '<b>Type: Tutorial<br>Restriction: None<br>28 - PE Make Ups/Tutorial</b><br>' ; 'Restriction: None<br>25 - A quiet place to study or talk about Psych<br>' no definitive pattern, will likely have to regex;
    // console.log(
    //   "Class data",
    //   opt.children().eq(0),
    //   opt.children().eq(1),
    //   opt.children().eq(2),
    //   opt.children().eq(3)
    // );
    // console.log("Text data", teacher, email, category, rawDesc);
    const type = rawDesc?.match(/Type: (.+?)(?=<br>)/)?.[1] ?? "Unknown";
    let restrictedToRaw =
      rawDesc?.match(/Restriction: (.+?)(?=<br>)/)?.[1] ?? "";
    const restrictedTo =
      restrictedToRaw.toLowerCase() === "none" ? "" : restrictedToRaw;
    const limdesc =
      rawDesc?.match(/(<br>)(\d+?)(?: - )(.+?)(?:<\/b>|<br>)/) ??
      new Array(5).fill(null);
    // console.log({ limdesc, og: rawDesc });
    const limit = Number.isInteger(parseInt(limdesc[2])) ? ~~limdesc[2] : null;
    const description = limdesc[3] ?? "No description provided";
    const teacherName = teacher?.includes(",")
      ? teacher.split(",").reverse()
      : teacher;
    let formattedTeacher = {
      displayName: teacher,
      ...(Array.isArray(teacherName) && {
        first: teacherName![0],
        last: teacherName![1],
        displayName: undefined,
      }),
      raw: teacher,
    };
    return {
      type,
      description,
      restrictions: restrictedTo,
      category,
      teacher: formattedTeacher,
      room: undefined,
      limit,
      open: limit !== null && limit > 0,
    } as ClassOption;
    // const [limit, description] = rawDesc?.split(" - ") as [string, string];
  }
}