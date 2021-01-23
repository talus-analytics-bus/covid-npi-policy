// return the object referenced by the path
export const getObjectByPath = ({ obj, path }) => {
  if (!obj) return undefined;
  if (!path) return undefined;
  if (path.length === 1) return obj[path[0]];
  return getObjectByPath({ obj: obj[path[0]], path: path.slice(1) });
};

// get the first valid path from the object,
// up until you hit a key that matches the
// idPattern regex or run out of nested objects
// in which case return the path up until undefined
export const getFirstPathFromObject = ({ obj, idPattern }) => {
  if (!obj) return undefined;

  const keys = Object.keys(obj);

  if (keys.length >= 1) {
    const nextKey = keys.includes("children") ? "children" : keys[0];

    if (idPattern.test(nextKey)) return [nextKey];
    return [
      nextKey,
      ...[
        getFirstPathFromObject({
          obj: { ...obj[nextKey] },
          idPattern,
        }) || undefined,
      ],
    ].flat();
  } else return undefined;
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

// return true or false if the path exists
export const pathExists = ({ obj, path }) => {
  if (path.length === 0) return true;
  if (!obj) return false;
  return pathExists({ obj: obj[path[0]], path: path.slice(1) });
};

// return true or false if the path
// leads to an object which is not empty
export const objectAtPathHasValues = ({ obj, path }) => {
  if (!obj) return false;
  if (path.length === 0) return Object.values(obj).length > 0;
  return objectAtPathHasValues({ obj: obj[path[0]], path: path.slice(1) });
};
