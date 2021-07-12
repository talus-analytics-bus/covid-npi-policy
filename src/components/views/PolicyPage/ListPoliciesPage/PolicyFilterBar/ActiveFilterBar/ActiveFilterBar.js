import React from "react";
import { useLocation } from "react-router-dom";

import RemoveFilterButton from "../RemoveFilterButton/RemoveFilterButton";

import filterIcon from "./filterIcon.svg";

import { policyContext } from "../../../PolicyRouter/PolicyRouter";

import styles from "./ActiveFilterBar.module.scss";

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
    setJurisdiction,
    policyFilters,
    setPolicyFilters,
    policyObject,
    setPolicyObject,
    policyCategories,
    policySearchResults,
    setSearchTextInputValue,
    setDateRangeControlValue,
  } = React.useContext(policyContext);

  const searchActive = policyFilters._text && policyFilters._text[0] !== "";

  const totalPolicyCount = Object.values(policyCategories).reduce(
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
      level: undefined,
      _text: undefined,
    }));
    setTargets(prev => ({ ...prev, selected: [] }));
    setJurisdiction(prev => ({ ...prev, selected: [] }));
    setPolicyObject({});
    setSearchTextInputValue("");
    setDateRangeControlValue({
      startDate: null,
      endDate: null,
      key: "selection",
    });
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
      {/* <p>
        <strong>Filters</strong>
      </p> */}
      <div className={styles.activeFilters}>{props.children}</div>
    </>
  );

  if (
    policyFilters.level ||
    policyFilters.subtarget ||
    policyFilters.dates_in_effect ||
    searchActive
  )
    return (
      <div className={styles.activeFilterBar}>
        <div className={styles.summary}>
          {!searchActive && !isNaN(filteredPolicyCount.count) && (
            <>
              <img className={styles.filterIcon} src={filterIcon} />
              <p className={styles.filterSummary}>
                Showing <strong>{filteredPolicyCount.count}</strong> out of{" "}
                <strong>{totalPolicyCount.count}</strong>{" "}
                {state !== "national"
                  ? "state and county"
                  : "national and local"}{" "}
                policies, of which{" "}
                <strong>{numbersToWords(filteredPolicyCount.active)}</strong>{" "}
                are currently active.
              </p>
            </>
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
            backgroundColor={"#ffffff"}
            className={styles.reset}
            onClick={resetFilters}
            style={{ background: "none", padding: "0.2em 0.4em" }}
          >
            Clear filters
          </RemoveFilterButton>
        </div>
        {(policyFilters.level ||
          policyFilters.subtarget ||
          policyFilters.dates_in_effect) &&
          datesAndTargets}
      </div>
    );
  else return <></>;
};

export default ActiveFilterBar;
