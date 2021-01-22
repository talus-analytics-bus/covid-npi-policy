import React from "react";
import { useLocation } from "react-router-dom";

import RemoveFilterButton from "../RemoveFilterButton/RemoveFilterButton";

import styles from "./ActiveFilterBar.module.scss";
import { policyContext } from "../../../PolicyRouter/PolicyRouter";

const numbersToWords = number =>
  ({
    0: "none",
    1: "one",
    2: "two",
    3: "three",
    4: "four",
    5: "five",
    6: "six",
    7: "seven",
    8: "eight",
    9: "nine",
  }[number] || number);

const ActiveFilterBar = props => {
  const [state] = useLocation()
    .pathname.replace(/\/$/, "")
    .split("/")
    .slice(-1);

  const {
    setStatus,
    setTargets,
    policyFilters,
    setPolicyFilters,
    policyObject,
    setPolicyObject,
    policySummaryObject,
    policySearchResults,
    setSearchTextInputValue,
  } = React.useContext(policyContext);

  const searchActive = policyFilters._text && policyFilters._text[0] !== "";

  const totalPolicyCount = Object.values(policySummaryObject).reduce(
    (acc, cur) => ({
      count: cur.count + acc.count,
      active: cur.active + acc.active,
    }),
    { count: 0, active: 0 }
  );

  const filteredPolicyCount = Object.values(policyObject).reduce(
    (acc, cur) => ({
      count: cur.count + acc.count,
      active: cur.active + acc.active,
    }),
    { count: 0, active: 0 }
  );

  const resetFilters = () => {
    setPolicyFilters(prev => ({
      ...prev,
      dates_in_effect: undefined,
      subtarget: undefined,
      _text: undefined,
    }));
    setTargets(prev => ({ ...prev, selected: [] }));
    setPolicyObject(policySummaryObject);
    setSearchTextInputValue("");
    setStatus(prev => ({
      ...prev,
      policies: "initial",
      searchResults: "initial",
    }));
  };

  const resultsCount = policySearchResults && policySearchResults.n;
  const displayingCount = resultsCount > 5 ? 5 : resultsCount;

  const datesAndTargets = (
    <>
      <p>
        <strong>Filters</strong>
      </p>
      <div className={styles.activeFilters}>{props.children}</div>
    </>
  );

  if (policyFilters.subtarget || policyFilters.dates_in_effect || searchActive)
    return (
      <div className={styles.activeFilterBar}>
        {(policyFilters.subtarget || policyFilters.dates_in_effect) &&
          datesAndTargets}
        <div className={styles.summary}>
          {!searchActive && !isNaN(filteredPolicyCount.count) && (
            <p className={styles.filterSummary}>
              Showing <strong>{filteredPolicyCount.count}</strong> out of{" "}
              <strong>{totalPolicyCount.count}</strong>{" "}
              {state !== "national" ? "state and county" : "national and local"}{" "}
              policies, of which{" "}
              <strong>{numbersToWords(filteredPolicyCount.active)}</strong> are
              currently active.
            </p>
          )}
          {searchActive && (
            <p className={styles.filterSummary}>
              {resultsCount > 0 ? (
                <>
                  Showing <strong>{displayingCount}</strong> of{" "}
                  <strong>{resultsCount}</strong> policies matching
                </>
              ) : (
                `No policies found matching`
              )}{" "}
              "{policyFilters._text}"{" "}
              {policyFilters.dates_in_effect && "active on the given dates"}
              {policyFilters.subtarget !== undefined &&
                (policyFilters.subtarget.length === 1
                  ? ` and targeting ${policyFilters.subtarget &&
                      policyFilters.subtarget[0]}`
                  : ` with one or more of the ${policyFilters.subtarget &&
                      numbersToWords(
                        policyFilters.subtarget.length
                      )} selected policy targets.`)}
            </p>
          )}
          <RemoveFilterButton
            light
            backgroundColor={"#eeeeee"}
            className={styles.reset}
            onClick={resetFilters}
          >
            Reset All Filters
          </RemoveFilterButton>
        </div>
      </div>
    );
  else return <></>;
};

export default ActiveFilterBar;
