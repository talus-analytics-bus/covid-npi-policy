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
          Object.entries(filters).map(([field, values]) => (
            <React.Fragment key={field + "-" + values.join("-")}>
              {field !== "_text" &&
                filterDefsObj[field] !== undefined &&
                !filterDefsObj[field].dateRange &&
                values.map(value =>
                  getBadge({
                    filters,
                    filterDefsObj,
                    label:
                      filterDefsObj[field].labelShort ||
                      filterDefsObj[field].label,
                    field,
                    value,
                    setFilters,
                    setSearchText,
                  })
                )}
              {field !== "_text" &&
                filterDefsObj[field] !== undefined &&
                filterDefsObj[field].dateRange &&
                getBadge({
                  filters,
                  filterDefsObj,
                  label:
                    filterDefsObj[field].labelShort ||
                    filterDefsObj[field].label,
                  field,
                  value: getInputLabel({
                    dateRange: true,
                    dateRangeState: [
                      { startDate: values[0], endDate: values[1] },
                    ],
                  } as any),
                  setFilters,
                  setSearchText,
                })}
            </React.Fragment>
          ))}
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

            if (
              filterDefsObj[field].dateRange ||
              newFilters[field].length === 0
            ) {
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
