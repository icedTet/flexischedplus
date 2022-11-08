export const MapToObj = <T>(map: Map<string, T>): { [key: string]: T } => {
  const obj: { [key: string]: T } = {};
  map.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
}
export const ObjToMap = <T>(obj: { [key: string]: T }): Map<string, T> => {
  const map = new Map<string, T>();
  Object.entries(obj).forEach(([key, value]) => {
    map.set(key, value);
  });
  return map;
}
