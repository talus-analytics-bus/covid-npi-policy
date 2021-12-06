import { encodeString, decodeString } from "use-query-params";
import { DataPageType, DataPageTypeVals } from "./Data";

/** Uses a comma to delimit entries. e.g. ['a', 'b'] => qp?=a,b */
export const DocTypeParam = {
  encode: (s: DataPageType | null | undefined): string | null | undefined =>
    encodeString(s as string),

  decode: (s: string | (string | null)[] | null | undefined): DataPageType => {
    if (DataPageTypeVals.includes(s as DataPageType))
      return decodeString(s) as DataPageType;
    else if (s === undefined) return "policy";
    else if (s === null) return "policy";
    return "policy";
  },
};
