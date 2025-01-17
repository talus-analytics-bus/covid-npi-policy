import { Filters } from "components/common/MapboxMap/plugins/mapTypes";
import { Option } from "components/common/OptionControls/types";
import { Dispatch, SetStateAction } from "react";

/**
 * Update the filters for the specified key to consist of the
 * specified options.
 *
 * @param {string} filterKey
 * The filter key
 *
 * @param {Filters} filters
 * The filters object to be updated
 *
 * @param {Dispatch<SetStateAction<Filters>>} setFilters
 * The state setter function for `filters`
 *
 * @param {Option[]} selectedOps
 * The currently selected options for the optionset
 *
 * @param {Option[]} possibleOps
 * The possible options for the optionset
 *
 * @param {Option[]} allSubOps
 * If applicable, all suboptions that could be used in the optionset that has
 * the defined `key`
 *
 * @returns {Filters}
 * The updated filters object, which has just been passed as an argument to
 * the call of its setter method `setFilters`.
 */
export const updateFilters = (
  filterKey: "primary_ph_measure" | "ph_measure_details",
  filters: Filters,
  setFilters: Dispatch<SetStateAction<Filters>>,
  selectedOps: Option[],
  possibleOps: Option[],
  allSubOps: Option[],
  setFiltersForApi?: Dispatch<SetStateAction<Filters>>,
  noChildCats?: Option[]
): Filters => {
  // if filter state variables undefined, abort
  if (filters === undefined || setFilters === undefined) return {};

  // initialized current and updated filters
  const currentFilters: Record<string, any> = {
    primary_ph_measure: [],
    ph_measure_details: [],
    ...filters,
  };
  const updatedFilters: Record<string, any> = {
    primary_ph_measure: [],
    ph_measure_details: [],
  };

  if (filters.subtarget !== undefined)
    updatedFilters.subtarget = filters.subtarget;

  // if category filter being updated:
  if (filterKey === "primary_ph_measure") {
    // update category filters
    // set updated category filters to equal selected values
    updatedFilters[filterKey] = selectedOps.map(o => o.value);

    // make list of cats for which not to add all subcats if none selected
    const catsDoNotAddChildren: string[] =
      filters.primary_ph_measure !== undefined
        ? possibleOps
            .filter(o =>
              filters.primary_ph_measure?.includes(o.value as string)
            )
            .map(o => o.value as string)
        : [];

    // update subcategory filters
    // Set updated subcat filters equal to current subcat filters except
    // those whose cats aren't in selected values
    updatedFilters.ph_measure_details = currentFilters.ph_measure_details;
    updatedFilters["ph_measure_details"] = currentFilters[
      "ph_measure_details"
    ].filter((v: string) => {
      const subcatOption: Option | undefined = allSubOps.find(
        o => o.value === v
      );
      const keepSubcatFilter: boolean =
        subcatOption !== undefined &&
        updatedFilters.primary_ph_measure.includes(subcatOption.parent);
      return keepSubcatFilter;
    });
    // For each updated cat filter, if no subcats for it are in updated
    // subcat filters, add every possible subcat
    updatedFilters.primary_ph_measure.forEach((v: string) => {
      if (catsDoNotAddChildren.includes(v)) return;
      const possibleCatSubcats: string[] = allSubOps
        .filter(o => o.parent === v)
        .map(o => o.value as string);
      const addAllCatSubcats = !updatedFilters.ph_measure_details.some(
        (v: string) => {
          return possibleCatSubcats.includes(v);
        }
      );
      if (addAllCatSubcats) {
        updatedFilters.ph_measure_details = updatedFilters.ph_measure_details.concat(
          possibleCatSubcats
        );
      }
    });

    // if no
  } else if (filterKey === "ph_measure_details") {
    // Remove all values from subcat filters that belong to the parent of
    // this checkbox set
    updatedFilters.primary_ph_measure = currentFilters.primary_ph_measure;
    const possibleCatSubcats: string[] = possibleOps.map(
      o => o.value as string
    );
    updatedFilters.ph_measure_details = currentFilters.ph_measure_details;
    updatedFilters.ph_measure_details = updatedFilters.ph_measure_details.filter(
      (v: string) => {
        return !possibleCatSubcats.includes(v);
      }
    );
    updatedFilters.ph_measure_details = updatedFilters.ph_measure_details.concat(
      selectedOps.map(o => o.value as string)
    );
  }
  setFilters(updatedFilters);

  // update filters for API
  if (setFiltersForApi !== undefined && noChildCats !== undefined) {
    const updatedFiltersForApi: Filters = getFiltersForApi(
      updatedFilters,
      noChildCats
    );
    setFiltersForApi(updatedFiltersForApi);
  }

  // return updated filters (not for API)
  return updatedFilters;
};

export function getFiltersForApi(
  filters: Filters,
  noChildCats: Option[]
): Filters {
  const someCatsOrig: boolean =
    filters.primary_ph_measure !== undefined &&
    filters.primary_ph_measure.length > 0;
  const updatedFiltersForApi: Filters = { ...filters };
  if (updatedFiltersForApi.primary_ph_measure !== undefined) {
    updatedFiltersForApi.primary_ph_measure = updatedFiltersForApi.primary_ph_measure.filter(
      (v: string) => !noChildCats.map(o => o.value).includes(v)
    );
  }
  // If some categories originally but none in updated, return no data
  const someCatsUpdated: boolean =
    updatedFiltersForApi.primary_ph_measure !== undefined &&
    updatedFiltersForApi.primary_ph_measure.length > 0;
  const returnNoData: boolean = someCatsOrig && !someCatsUpdated;
  if (returnNoData) updatedFiltersForApi.primary_ph_measure = ["None"];
  return updatedFiltersForApi;
}
