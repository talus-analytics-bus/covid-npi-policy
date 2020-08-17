import React from "react";
import { useState, useEffect, useRef } from "react";
import moment from "moment";
import axios from "axios";

// common components
import { FilterSet, Table, RadioToggle, ShowMore } from "../../common";
import Drawer from "../../layout/drawer/Drawer.js";
import {
  Metadata,
  Policy,
  OptionSet,
  Export,
  execute,
} from "../../misc/Queries.js";
import { isEmpty, comma } from "../../misc/Util.js";

// styles and assets
import styles from "./data.module.scss";
import classNames from "classnames";
import downloadSvg from "../../../assets/icons/download.svg";

// constants
import policyInfo from "./content/policy";
import planInfo from "./content/plan";
const API_URL = process.env.REACT_APP_MODEL_API_URL;

// primary data viewing and download page
const Data = ({
  setLoading,
  loading,
  setInfoTooltipContent,
  setPage,
  urlFilterParamsPolicy,
  urlFilterParamsPlan,
  type,
  counts,
}) => {
  const [docType, setDocType] = useState(type || "policy");
  const [entityInfo, setEntityInfo] = useState(policyInfo);
  const [curPage, setCurPage] = useState(1);
  const [numInstances, setNumInstances] = useState(null);
  const [ordering, setOrdering] = useState([]);
  let searchRef = useRef(null);
  const [pagesize, setPagesize] = useState(5); // TODO dynamically

  // set `unspecified` component, etc., from entity info
  const unspecified = entityInfo.unspecified;
  const nouns = entityInfo.nouns;

  // define data and metadata for table
  const [data, setData] = useState(null);

  const [metadata, setMetadata] = useState(null);

  // define filters
  const getFiltersFromUrlParams = () => {
    // If filters are specific in the url params, and they are for the current
    // entity class, use them. Otherwise, clear them
    const urlFilterParams =
      docType === "policy" ? urlFilterParamsPolicy : urlFilterParamsPlan;
    const useUrlFilters = urlFilterParams !== null;
    const newFilters = useUrlFilters ? urlFilterParams : {};
    return newFilters;
  };
  const initFilters = getFiltersFromUrlParams();
  const [filters, setFilters] = useState(initFilters);

  // min and max dates for date range pickers dynamically determined by data
  const [minMaxStartDate, setMinMaxStartDate] = useState({
    min: undefined,
    max: undefined,
  });
  const [minMaxEndDate, setMinMaxEndDate] = useState({
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
        page: curPage,
        pagesize,
        ordering,
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
          if (!key.includes(".")) return docType + "." + key;
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
        for (const [k, v] of Object.entries(d)) {
          if (!k.startsWith("date")) d[k].items = optionsets[k];
          if (k === "dates_in_effect") {
            // set min/max date range for daterange filters
            d[k].minMaxDate = {
              min: newMinMaxStartDate.min,
              max: undefined,
            };
          }
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
    const newEntityInfo = docType === "policy" ? policyInfo : planInfo;

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

    // update entity info and get data
    setEntityInfo(newEntityInfo);
    getData({
      filtersForQuery: newFilters,
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
        filtersForQuery: { ...filters, _text: [searchRef.current.value] },
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

      // get key corresponding to the currently viewed doc type's filters
      const filtersUrlParamKey = "filters_" + docType;

      // TODO make the below work with two filter sets
      // Default state is the currently selected filters per the URL params
      const newState = { type: docType };
      if (curUrlFilterParamsPolicy !== null)
        newState.filters_policy = curUrlFilterParamsPolicy;
      if (curUrlFilterParamsPlan !== null)
        newState.filters_plan = curUrlFilterParamsPlan;

      if (isEmpty(filters)) {
        // clear filters for current doc type and update window history
        newState[filtersUrlParamKey] = "";
      } else {
        newState[filtersUrlParamKey] = JSON.stringify(filters);
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
  }, [filters, pagesize]);

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

  return (
    <div className={styles.data}>
      <div className={styles.header}>
        <h1>COVID AMP policy and plan database</h1>
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
        <React.Fragment>
          <Drawer
            {...{
              title: <h2>Policy and plan database</h2>,
              label: DownloadBtn({
                render: counts,
                class_name: "all_static",
                filters: {},
                disabled: false,
                message: (
                  <React.Fragment>
                    <span>Download all data</span>
                    <span>
                      {comma(counts["Policy"])} policies and{" "}
                      {comma(counts["Plan"])} plans
                    </span>
                  </React.Fragment>
                ),
              }),
              noCollapse: false,
              content: (
                <React.Fragment>
                  <div className={styles.contentTop}>
                    <RadioToggle
                      label={"View"}
                      choices={[
                        { name: "Policies", value: "policy" },
                        {
                          name: "Plans",
                          value: "plan",
                        },
                      ]}
                      curVal={docType}
                      callback={setDocType}
                      horizontal={true}
                      selectpicker={false}
                      setInfoTooltipContent={setInfoTooltipContent}
                    />
                    {DownloadBtn({
                      render: table,
                      class_name: nouns.s,
                      filters,
                      disabled: data && data.length === 0,
                      message: (
                        <React.Fragment>
                          <span>
                            {data && data.length === 0 && (
                              <>No {nouns.p.toLowerCase()} found</>
                            )}
                            {data && data.length > 0 && (
                              <>
                                Download {isEmpty(filters) ? "all" : "filtered"}{" "}
                                {nouns.p.toLowerCase()} ({comma(numInstances)})
                              </>
                            )}
                          </span>

                          {
                            //   data && (
                            //   <span>
                            //     {comma(data.length)}{" "}
                            //     {data.length === 1
                            //       ? nouns.s.toLowerCase()
                            //       : nouns.p.toLowerCase()}
                            //   </span>
                            // )
                          }
                        </React.Fragment>
                      ),
                    })}
                  </div>
                  {table && (
                    <>
                      <div>
                        Select filters to apply to {nouns.p.toLowerCase()}.{" "}
                        {Object.keys(filters).length > 0 && (
                          <button onClick={() => setFilters({})}>
                            Clear filters
                          </button>
                        )}
                      </div>

                      <FilterSet {...{ filterDefs, filters, setFilters }} />
                    </>
                  )}
                </React.Fragment>
              ),
            }}
          />
          <button
            onClick={() => {
              setCurPage(curPage + 1);
            }}
          >
            Next page
          </button>
          <input type="text" ref={searchRef}></input>
          {table}
          {!table && <div style={{ height: "900px" }} />}
        </React.Fragment>
      )}
    </div>
  );
};

const DownloadBtn = ({ render, message, class_name, filters, disabled }) => {
  // flag for whether the download button should say loading or not
  const [buttonLoading, setButtonLoading] = useState(false);

  return (
    render && (
      <button
        className={classNames(styles.downloadBtn, {
          [styles.loading]: buttonLoading || disabled,
          [styles[class_name]]: true,
        })}
        onClick={e => {
          e.stopPropagation();
          if (class_name === "all_static") {
            window.location.assign(
              "https://gida.ghscosting.org/downloads/COVID%20AMP%20-%20Policy%20and%20Plan%20Data%20Export.xlsx"
            );
          } else {
            setButtonLoading(true);

            Export({
              method: "post",
              filters,
              class_name,
            }).then(d => setButtonLoading(false));
          }
        }}
      >
        <img src={downloadSvg} />
        <div>
          {!buttonLoading && render && message}
          {buttonLoading && (
            <React.Fragment>
              <span>Downloading data, please wait...</span>
            </React.Fragment>
          )}
        </div>
      </button>
    )
  );
};

export default Data;
