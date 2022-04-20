import { FilterDefs } from "src/components/common/MapboxMap/plugins/mapTypes";

export type DataPageInfo = {
    [k: string]: any;
    filterDefs: FilterDefs[],
    nouns: {
        s: string;
        p: string;
    }
    dataQuery(...args: any[]): any;
}