// return the object referenced by the path
export const getObjectByPath = ({ obj, path }) => {
  if (!obj) return undefined;
  if (!path) return undefined;
  if (path.length === 1) return obj[path[0]];
  return getObjectByPath({ obj: obj[path[0]], path: path.slice(1) });
};

// get the first valid path from the object,
// up until you hit a key that matches the
// idPattern regex
export const getFirstPathFromObject = ({ obj, idPattern }) => {
  if (!obj) return undefined;
  if (Object.keys(obj).length >= 1) {
    const nextKey = Object.keys(obj)[0];

    if (idPattern.test(nextKey)) return [nextKey];
    return [
      nextKey,
      ...getFirstPathFromObject({
        obj: { ...obj[Object.keys(obj)] },
        idPattern,
      }),
    ].flat();
  }
};

// recursively climb down through object according
// to an array of keys (the "path"), setting the lowest
// level of that object to the value, and creating any
// new nested objects needed to fulfill the path
export const extendObjectByPath = ({ obj, path, valueObj }) => {
  if (path.length === 1) {
    obj[path[0]] = { ...obj[path[0]], ...valueObj };
  } else {
    obj[path[0]] = obj[path[0]] || {};
    extendObjectByPath({ obj: obj[path[0]], path: path.slice(1), valueObj });
  }
};
