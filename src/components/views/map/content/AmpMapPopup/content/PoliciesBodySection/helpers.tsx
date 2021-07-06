import { Option } from "components/common/OptionControls/types";

/**
 * Returns true if subcategory filters contain information and should be
 * included in API request filters, false if they simply represent all possible
 * subcategories for all defined categories.
 * @param categories Array of strings of policy categories selected
 * @param subcategories Array of strings of policy subcategories selected
 * @param noun Plurality of policy noun to use
 * @returns {boolean} True if subcategory filters contain information and
 * should be included in API request filters, false if they simply represent
 * all possible subcategories for all defined categories.
 */
export const includeSubcatFilters: Function = (
  categories: string[] = [],
  subcategories: string[] = [],
  subcatOptions: Option[]
): boolean => {
  const nSubcats: number = subcategories.length;
  const nCats: number = categories.length;
  const uniqueSubcats = Array.from(new Set(subcategories));

  // if only one category and all subcats selected, show as if nCats is 1 and
  // subcats is zero
  const allSubcatsSelected = !categories.some(c => {
    const subcatsPossible: string[] = subcatOptions
      .filter(sc => sc.parent === c)
      .map(sc => sc.value as string);
    const nCatSubcatsSelected: number = uniqueSubcats.filter(sc =>
      subcatsPossible.includes(sc)
    ).length;
    const nCatSubcats = subcatsPossible.length;
    return nCatSubcats !== nCatSubcatsSelected;
  });

  if (nCats > 1 && (allSubcatsSelected || nSubcats === 0)) {
    // multi category, no subcat
    return false;
  } else if (nCats === 0 && nSubcats === 0) {
    return false;
  } else if (nCats === 1 && (nSubcats === 0 || allSubcatsSelected)) {
    // one category, zero subcat
    return false;
  } else if (nCats === 1 && nSubcats === 1) {
    // one category, one subcat
    return true;
  } else if (nCats === 1 && nSubcats > 1) {
    // one category, more than one subcat
    return true;
  } else if (nCats > 1 && nSubcats > 0) {
    // multi category, some subcat
    return true;
  } else {
    throw Error("Unreachable state reached.");
  }
};

/**
 * Returns string succinctly expressing categories and/or subcategories of
 * policy selected
 * @param categories Array of strings of policy categories selected
 * @param subcats Array of strings of policy subcategories selected
 * @param noun Plurality of policy noun to use
 * @param {boolean} forLegend True if phrase for legend, false otherwise
 * @returns {string} String expressing cats. / subcats. of policy selected
 */
export const getPolicyCatSubcatPhrase: Function = (
  categories: string[] = [],
  subcats: string[] = [],
  subcatOptions: Option[],
  noun: "policies" | "policy",
  forLegend: boolean = false
): string => {
  const suffix: string = ` ${noun} in effect`;
  const nSubcats: number = subcats.length;
  const nCats: number = categories.length;
  const uniqueSubcats = Array.from(new Set(subcats));

  // if only one category and all subcats selected, show as if nCats is 1 and
  // subcats is zero
  const allSubcatsSelected = !categories.some(c => {
    const subcatsPossible: string[] = subcatOptions
      .filter(sc => sc.parent === c)
      .map(sc => sc.value as string);
    const nCatSubcatsSelected: number = uniqueSubcats.filter(sc =>
      subcatsPossible.includes(sc)
    ).length;
    const nCatSubcats = subcatsPossible.length;
    return nCatSubcats !== nCatSubcatsSelected;
  });

  // special case: only cats selected and no subcats --> "none"
  const isNone = categories.length === 1 && categories[0] === "None";
  if (isNone) {
    return forLegend
      ? "Policies with selected subcategories in effect"
      : "Select subcategories to view data";
  } else if (nCats > 1 && (allSubcatsSelected || nSubcats === 0)) {
    // multi category, no subcat
    return ` ${noun} with selected categories in effect`;
  } else if (nCats === 0 && nSubcats === 0) {
    return `${noun} in effect`;
  } else if (nCats === 1 && (nSubcats === 0 || allSubcatsSelected)) {
    // one category, zero subcat
    return categories[0].toLowerCase() + suffix;
  } else if (nCats === 1 && nSubcats === 1) {
    // one category, one subcat
    return subcats[0].toLowerCase() + suffix;
  } else if (nCats === 1 && nSubcats > 1) {
    // one category, more than one subcat
    return (
      ` ${categories[0].toLowerCase()} ${noun} with selected ` +
      `subcategories in effect`
    );
  } else if (nCats > 1 && nSubcats > 0) {
    // multi category, some subcat
    return ` ${noun} with selected categories and subcategories in effect`;
  } else {
    throw Error("Unreachable state reached.");
  }
};
