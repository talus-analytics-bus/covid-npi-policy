// 3rd party packages
import React, { ReactElement, FC, SetStateAction } from "react";

// styles and assets
import styles from "./FilterSetSelections.module.scss";
import funnelSvg from "assets/icons/funnel.svg";
import { Filters } from "components/common/MapboxMap/plugins/mapTypes";

// local helper functions
import { comma } from "components/misc/Util";
import { getInputLabel } from "components/common/Filter/Filter";

// local components
import { ShowMore, XCloseBtn } from "components/common";
import { Dispatch } from "react";
import { ClearFiltersBtn } from "./content/ClearFiltersBtn/ClearFiltersBtn";
import { getInitCap } from "components/misc/UtilsTyped";

/**
 * Properties for the `FilterSetSelections` function component.
 */
interface FilterSetSelectionsProps {
  filters: Filters;
  searchText: string | null;
  filterDefsObj: any; // TODO type
  noNonTextFilters: boolean;
  numInstances: number | null;
  instanceNouns: {
    p: string;
    s: string;
  } | null;
  setFilters: Dispatch<SetStateAction<Filters>>;
  setSearchText: Dispatch<SetStateAction<string | null>>;

  /**
   * Function called when "Clear filters" button clicked. If undefined, the
   * button will never be shown.
   * @param args Optional arguments for function
   */
  onClearAll?(...args: any[]): void;
}
export const FilterSetSelections: FC<FilterSetSelectionsProps> = ({
  filters,
  searchText,
  filterDefsObj,
  noNonTextFilters,
  numInstances,
  instanceNouns,
  setFilters,
  setSearchText,
  onClearAll,
}): ReactElement => {
  return (
    <div className={styles.selectedFilters}>
      <div className={styles.header}>
        <div className={styles.filterIcon}>
          <div style={{ backgroundImage: `url(${funnelSvg})` }} />
        </div>
        <span>
          Selected filters{" "}
          {numInstances !== null && instanceNouns !== null && (
            <span>
              ({comma(numInstances)}{" "}
              {numInstances !== 1
                ? instanceNouns.p.toLowerCase()
                : instanceNouns.s.toLowerCase().replace("_", " ")}
              )
            </span>
          )}
        </span>
        <ClearFiltersBtn right onClick={onClearAll} />
      </div>

      <div className={styles.badges}>
        {!noNonTextFilters &&
          Object.entries(filters).map(([fField, fVals]) => {
            const fIsDefined: boolean = filterDefsObj[fField] !== undefined;
            const fIsDate: boolean =
              fIsDefined && filterDefsObj[fField].dateRange;
            const fIsText: boolean = fField === "_text";
            const fValsBadge = fIsDate ? [fVals[0]] : fVals;
            return (
              !fIsText && (
                <React.Fragment key={fField + "-" + fValsBadge.join("-")}>
                  {fValsBadge.map(val =>
                    getBadge({
                      field: fField,
                      label: getFilterDisplayLabel(filterDefsObj, fField),
                      value: getFilterDisplayVals(fVals, val, fIsDate),
                      filters,
                      filterDefsObj,
                      setFilters,
                      setSearchText,
                    })
                  )}
                </React.Fragment>
              )
            );
          })}
        {searchText !== null &&
          searchText !== "" &&
          getBadge({
            filters,
            filterDefsObj,
            label: "Text",
            field: "Text",
            value: searchText,
            setFilters,
            setSearchText,
          })}
      </div>
    </div>
  );
};

interface GetBadgeProps {
  filters: Filters;
  filterDefsObj: any; // TODO type
  label: string;
  field: string;
  value: any;
  setFilters: Dispatch<SetStateAction<Filters>>;
  setSearchText: Dispatch<SetStateAction<string | null>>;
}

function getFilterDisplayLabel(filterDefsObj: any, fField: string): string {
  const fIsDefined: boolean = filterDefsObj[fField] !== undefined;
  if (fIsDefined)
    return filterDefsObj[fField].labelShort || filterDefsObj[fField].label;
  else return getInitCap(fField);
}

/**
 * Returns the display value for the badge corresponding to this filter value.
 *
 * @param {string[]} fVals
 * The filter values
 *
 * @param {string} val
 * The filter value for this badge
 *
 * @param {boolean} isDateRange
 * True if this filter is a date range, false otherwise
 *
 * @returns {any}
 * The string or element that should be displayed as the value of the
 * filter badge
 */
export function getFilterDisplayVals(
  fVals: string[],
  val: string,
  isDateRange: boolean
): any {
  if (!isDateRange) return val;
  else
    return getInputLabel({
      dateRange: true,
      dateRangeState: [{ startDate: fVals[0], endDate: fVals[1] }],
    } as any);
}

/**
 * Return a badge representing the filter value that can be clicked off
 * @method getBadge
 */
function getBadge({
  filters,
  filterDefsObj,
  label,
  field,
  value,
  setFilters,
  setSearchText,
}: GetBadgeProps): ReactElement {
  return (
    <div className={styles.badge} key={field + "-" + value}>
      <span>
        <span className={styles.label}>{label}:</span>
        <span className={styles.value}>
          {" "}
          {<ShowMore text={value} charLimit={60} />}
        </span>
      </span>
      <XCloseBtn
        style={{ marginLeft: "1em" }}
        onClick={() => {
          if (field !== "Text") {
            const newFilters = { ...filters };
            newFilters[field] = newFilters[field].filter(v => v !== value);

            const fIsDefined: boolean = filterDefsObj[field] !== undefined;
            const fIsDate: boolean =
              fIsDefined && filterDefsObj[field].dateRange;
            if (fIsDate || newFilters[field].length === 0) {
              delete newFilters[field];
              setFilters(newFilters);
            } else {
              setFilters(newFilters);
            }
          } else {
            setSearchText(null);
          }
        }}
      />
    </div>
  );
}
