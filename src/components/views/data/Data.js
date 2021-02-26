import React from "react";
import { useState, useEffect } from "react";
import moment from "moment";

// common components
import Search from "../../common/Table/content/Search/Search";
import { FilterSet, Table, RadioToggle, PrimaryButton } from "../../common";
import Drawer from "../../layout/drawer/Drawer.js";
import { Metadata, OptionSet, Export, execute } from "../../misc/Queries.js";
import { isEmpty, comma } from "../../misc/Util.js";

// styles and assets
import styles from "./data.module.scss";

// constants
import policyInfo from "./content/policy";
import planInfo from "./content/plan";
import challengeInfo from "./content/challenge.js";

// primary data viewing and download page
const Data = ({
  setLoading,
  loading,
  setInfoTooltipContent,
  setPage,
  urlFilterParamsPolicy,
  urlFilterParamsPlan,
  urlFilterParamsChallenge,
  type,
  counts,
}) => {
  const [docType, setDocType] = useState(type || "policy");
  const [entityInfo, setEntityInfo] = useState(policyInfo);
  const [curPage, setCurPage] = useState(1);
  const [numInstances, setNumInstances] = useState(null);
  const [ordering, setOrdering] = useState(
    docType === "challenge"
      ? [["date_of_complaint", "desc"]]
      : [["date_start_effective", "desc"]]
  );
  const [buttonLoading, setButtonLoading] = useState(false);
  const [pagesize, setPagesize] = useState(5); // TODO dynamically

  // set `unspecified` component, etc., from entity info
  const nouns = entityInfo.nouns;

  // define data and metadata for table
  const [data, setData] = useState(null);

  const [, setMetadata] = useState(null);

  // define filters
  const getFiltersFromUrlParams = () => {
    // If filters are specific in the url params, and they are for the current
    // entity class, use them. Otherwise, clear them
    const urlFilterParams = {
      policy: urlFilterParamsPolicy,
      plan: urlFilterParamsPlan,
      challenge: urlFilterParamsChallenge,
    }[docType];

    const useUrlFilters = urlFilterParams !== null;
    const newFilters = useUrlFilters ? urlFilterParams : {};
    return newFilters;
  };
  const initFilters = getFiltersFromUrlParams();
  const [filters, setFilters] = useState(initFilters);

  const [searchText, setSearchText] = useState(
    initFilters._text !== undefined ? initFilters._text[0] : null
  );

  // min and max dates for date range pickers dynamically determined by data
  const [, setMinMaxStartDate] = useState({
    min: undefined,
    max: undefined,
  });
  const [, setMinMaxEndDate] = useState({
    min: undefined,
    max: undefined,
  });

  // define filters in groups
  // TODO make simpler, probably removing the `field` key
  const [filterDefs, setFilterDefs] = useState(entityInfo.filters);

  const [columns, setColumns] = useState(null);

  /**
   * Get data for page
   * @method getData
   * @param  {Object}  [filters={}] [description]
   * @return {Promise}              [description]
   */
  const getData = async ({
    filtersForQuery,
    entityInfoForQuery,
    orderingForQuery = ordering,
    getOptionSets = false,
  }) => {
    const method = "post";
    // const method = Object.keys(filtersForQuery).length === 0 ? "get" : "post";
    const initColumns = entityInfoForQuery.getColumns({
      metadata: {},
      setOrdering,
    });
    const queries = {
      instances: entityInfoForQuery.dataQuery({
        method,
        filters: filtersForQuery,
        ordering: orderingForQuery,
        page: curPage,
        pagesize,
      }),
    };

    if (getOptionSets) {
      queries.optionsets = OptionSet({
        method: "get",
        class_name: entityInfoForQuery.nouns.s,
        fields: entityInfoForQuery.filterDefs
          .map(d => Object.values(d).map(dd => dd))
          .flat()
          .filter(d => !d.field.startsWith("date"))
          .map(d => {
            return d.entity_name + "." + d.field;
          }),
        entity_name: entityInfoForQuery.nouns.s,
      });
      queries.metadata = Metadata({
        method: "get",
        fields: initColumns.map(d => {
          const key = d.defKey || d.dataField;
          if (!key.includes("."))
            return entityInfoForQuery.nouns.s.toLowerCase() + "." + key;
          else return key;
        }),
        entity_class_name: entityInfoForQuery.nouns.s,
      });
    }

    // execute queries and collate results
    const results = await execute({
      queries,
    });

    // set data and metadata with results
    setData(results.instances.data);
    setNumInstances(results.instances.n);

    // define min/max range of daterange pickers
    // TODO modularize and reuse repeated code
    const policyDatesStart = results.instances.data
      .map(d => d.date_start_effective)
      .filter(d => d)
      .sort();
    const policyDatesEnd = results.instances.data
      .map(d => d.date_end_actual)
      .filter(d => d)
      .sort();
    const newMinMaxStartDate = {
      min: new Date(moment(policyDatesStart[0]).utc()),
      max: new Date(
        moment(policyDatesStart[policyDatesStart.length - 1]).utc()
      ),
    };
    const newMinMaxEndDate = {
      min: new Date(moment(policyDatesEnd[0]).utc()),
      max: new Date(moment(policyDatesEnd[policyDatesEnd.length - 1]).utc()),
    };

    setMinMaxStartDate(newMinMaxStartDate);
    setMinMaxEndDate(newMinMaxEndDate);

    // if page is first initializing, also retrieve filter optionset values for
    // non-date filters
    // TODO move this out of main code if possible
    if (getOptionSets) {
      setMetadata(results.metadata.data);

      const optionsets = results["optionsets"];

      // set options for filters
      const newFilterDefs = [...entityInfoForQuery.filterDefs];
      newFilterDefs.forEach(d => {
        for (const [k] of Object.entries(d)) {
          if (!k.startsWith("date")) d[k].items = optionsets[k];
        }
      });
      setFilterDefs(newFilterDefs);
      setColumns(
        entityInfoForQuery.getColumns({
          metadata: results.metadata.data,
          setOrdering,
        })
      );
    }
    setLoading(false);
  };

  // EFFECT HOOKS // ---------—---------—---------—---------—---------—------//
  // on initial page load, get all data and filter optionset values
  useEffect(() => {
    // scroll to top of page
    window.scrollTo(0, 0);

    // set loading spinner to visible
    setLoading(true);

    // set current page
    setPage("data");
  }, []);

  // when doc type changes, nullify columns / data / filter defs, then update
  // entity info
  useEffect(() => {
    setLoading(true);
    setColumns(null);
    setData(null);
    setFilterDefs(null);
    setOrdering(
      docType === "challenge"
        ? [["date_of_complaint", "desc"]]
        : [["date_start_effective", "desc"]]
    );

    const newEntityInfo = {
      policy: policyInfo,
      plan: planInfo,
      challenge: challengeInfo,
    }[docType];

    // get current URL params
    const urlParams = new URLSearchParams(window.location.search);

    // update which doc type is being viewed
    urlParams.set("type", docType);

    const newState = {};
    for (const [k, v] of urlParams.entries()) {
      if (v !== null && v !== "") {
        newState[k] = v;
      }
    }
    const newUrl = urlParams.toString() !== "" ? `/data?${urlParams}` : "/data";
    window.history.replaceState(newState, "", newUrl);

    const newFilters = getFiltersFromUrlParams();
    setFilters(newFilters);
    setSearchText(newFilters._text !== undefined ? newFilters._text[0] : null);

    // update entity info and get data
    setEntityInfo(newEntityInfo);
    getData({
      filtersForQuery: newFilters,
      orderingForQuery:
        docType === "challenge"
          ? [["date_of_complaint", "desc"]]
          : [["date_start_effective", "desc"]],
      entityInfoForQuery: newEntityInfo,
      initializingForQuery: true,
      getOptionSets: true,
    });
  }, [docType]);

  const updateData = () => {
    if (!loading) {
      // update data
      setLoading(true);
      getData({
        filtersForQuery: {
          ...filters,
          _text: searchText !== null ? [searchText] : [],
        },
        entityInfoForQuery: entityInfo,
        initializingForQuery: true,
      });

      // update URL params string
      // if filters are empty, clear all URL search params

      // get current URL params
      const urlParams = new URLSearchParams(window.location.search);

      // get filter strings for each doc type
      const curUrlFilterParamsPolicy = urlParams.get("filters_policy");
      const curUrlFilterParamsPlan = urlParams.get("filters_plan");
      // const curUrlFilterParamsChallenge = urlParams.get("filters_challenge");

      // get key corresponding to the currently viewed doc type's filters
      const filtersUrlParamKey = "filters_" + docType;

      // TODO make the below work with two filter sets
      // Default state is the currently selected filters per the URL params
      const newState = { type: docType };
      if (curUrlFilterParamsPolicy !== null)
        newState.filters_policy = curUrlFilterParamsPolicy;
      if (curUrlFilterParamsPlan !== null)
        newState.filters_plan = curUrlFilterParamsPlan;

      if (isEmpty(filters) && searchText === null) {
        // clear filters for current doc type and update window history
        newState[filtersUrlParamKey] = "";
      } else {
        const newFiltersForState = {
          ...filters,
        };
        // add search text to new URL state if it's not null
        if (searchText !== null) {
          newFiltersForState._text = [searchText];
        } else {
          delete newFiltersForState._text;
        }
        newState[filtersUrlParamKey] = JSON.stringify(newFiltersForState);
      }
      const newUrlParams = new URLSearchParams();
      for (const [k, v] of Object.entries(newState)) {
        if (v !== null && v !== "") {
          newUrlParams.append(k, v);
        }
      }
      const newUrl =
        newUrlParams.toString() !== "" ? `/data?${newUrlParams}` : "/data";

      window.history.replaceState(newState, "", newUrl);
    }
  };

  useEffect(() => {
    if (curPage !== 1) setCurPage(1);
    else updateData();
    // updateData();
  }, [filters, pagesize, searchText]);

  // when filters are updated, update data
  useEffect(() => {
    updateData();
  }, [ordering, curPage]);

  // define which table component to show based on selected doc type
  const getTable = ({ docType }) => {
    if (columns === null || data === null || filterDefs === null) return null;
    else
      return (
        <Table
          {...{
            nTotalRecords: numInstances,
            curPage,
            setCurPage,
            pagesize,
            columns,
            data,
            defaultSortedField: entityInfo.defaultSortedField,
            className: styles[entityInfo.nouns.s.toLowerCase()],
            setPagesize,
          }}
        />
      );
  };

  const table = getTable({ docType });

  // have any filters or search text been applied?
  const hasFilters = !(
    isEmpty(filters) &&
    (searchText === null || searchText === "")
  );

  return (
    <div className={styles.data}>
      <div className={styles.header}>
        <h1>COVID AMP data access</h1>
        <div className={styles.columnText}>
          <p>
            The COVID Analysis and Mapping of Policies (AMP) site provides
            access to a comprehensive list of policies and plans implemented
            globally to address the COVID-19 pandemic. In many cases, response
            efforts have been led by subnational governments or private and
            non-profit organizations. For simple search, each policy or plan has
            been categorized by the type of measure, in addition to
            implementation date and authorizing agency. In addition, policies
            can be identified by legal authority and plans by type of
            organization. Where available, PDFs or links to the original
            document or notice are included.
          </p>
        </div>
      </div>
      {!false && (
        <>
          <Drawer
            {...{
              title: <h2>Search and filter</h2>,
              label: DownloadBtn({
                render: table,
                class_name: [nouns.s, "secondary"],
                classNameForApi: hasFilters ? nouns.s : "All_data",
                buttonLoading,
                setButtonLoading,
                searchText,
                filters,
                disabled: data && data.length === 0,
                message: (
                  <span>
                    {data && data.length === 0 && (
                      <>No {nouns.p.toLowerCase()} found</>
                    )}
                    {data && data.length > 0 && (
                      <>
                        <span className={styles.primaryText}>
                          Download {!hasFilters ? "all" : "filtered"} data
                        </span>
                        <br />({comma(numInstances)}{" "}
                        {numInstances !== 1
                          ? nouns.p.toLowerCase()
                          : nouns.s.toLowerCase().replace("_", " ")}
                        , .xlsx)
                      </>
                    )}
                  </span>
                ),
              }),
              noCollapse: false,
              content: (
                <>
                  <div className={styles.contentTop}>
                    <RadioToggle
                      label={"View"}
                      choices={[
                        { name: "Policies", value: "policy" },
                        { name: "Plans", value: "plan" },
                        // { name: "Court challenges", value: "challenge" },
                      ]}
                      curVal={docType}
                      callback={setDocType}
                      horizontal={true}
                      selectpicker={false}
                      setInfoTooltipContent={setInfoTooltipContent}
                    />
                    <Search
                      searchText={searchText}
                      onChangeFunc={setSearchText}
                    />
                  </div>
                  {
                    <>
                      {table && (
                        <>
                          {" "}
                          <div className={styles.filtersHeader}>
                            Select filters to apply to {nouns.p.toLowerCase()}.
                            {(Object.keys(filters).length > 0 ||
                              (searchText !== null && searchText !== "")) && (
                              <>
                                &nbsp;
                                <button
                                  onClick={() => {
                                    setSearchText(null);
                                    setFilters({});
                                  }}
                                >
                                  Clear filters
                                </button>
                              </>
                            )}
                          </div>
                          <FilterSet
                            {...{
                              filterDefs,
                              filters,
                              setFilters,
                              searchText,
                              setSearchText,
                              alignBottom: true,
                              numInstances,
                              instanceNouns: nouns,
                            }}
                          ></FilterSet>
                        </>
                      )}
                    </>
                  }
                </>
              ),
            }}
          />

          {table}
          {!table && <div style={{ height: "900px" }} />}
        </>
      )}
    </div>
  );
};

export const DownloadBtn = ({
  render = true,
  message = "Download",
  class_name = [],
  classNameForApi,
  filters,
  disabled,
  searchText,
  buttonLoading = false,
  setButtonLoading = () => "",
}) => {
  // define custom class names
  const thisClassNames = {
    [styles.loading]: buttonLoading || disabled,
  };
  class_name.forEach(d => {
    thisClassNames[styles[d]] = true;
  });
  // flag for whether the download button should say loading or not
  return (
    render && (
      <PrimaryButton
        iconName={"get_app"}
        label={
          <div>
            {!buttonLoading && render && message}
            {buttonLoading && (
              <>
                <span>Downloading, please wait...</span>
              </>
            )}
          </div>
        }
        customClassNames={[styles.downloadBtn, ...Object.keys(thisClassNames)]}
        onClick={e => {
          e.stopPropagation();
          if (class_name[0] === "All_data") {
            window.location.assign(
              "https://ghssidea.org/downloads/COVID%20AMP%20-%20Policy%20and%20Plan%20Data%20Export.xlsx"
            );
          } else {
            setButtonLoading(true);

            Export({
              method: "post",
              filters: {
                ...filters,
                _text: searchText !== null ? [searchText] : [],
              },
              class_name: classNameForApi,
            }).then(d => setButtonLoading(false));
          }
        }}
      />
    )
  );
};

export default Data;
