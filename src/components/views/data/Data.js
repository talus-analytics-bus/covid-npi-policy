import React from "react";
import { useState, useEffect } from "react";
import moment from "moment";
import axios from "axios";

// common compoments
import { FilterSet, Table, RadioToggle, ShowMore } from "../../common";
import Drawer from "../../layout/drawer/Drawer.js";
import {
  Metadata,
  Policy,
  OptionSet,
  Export,
  execute
} from "../../misc/Queries.js";
import { isEmpty, comma } from "../../misc/Util.js";

// styles and assets
import styles from "./data.module.scss";
import classNames from "classnames";
import downloadSvg from "../../../assets/icons/download.svg";

// constants
import policyInfo from "./content/policy";
import planInfo from "./content/plan";
const API_URL = process.env.REACT_APP_API_URL;

// primary data viewing and download page
const Data = ({
  setLoading,
  setInfoTooltipContent,
  setPage,
  urlFilterParams
}) => {
  const [docType, setDocType] = useState("policy");
  const [entityInfo, setEntityInfo] = useState(
    docType === "policy" ? policyInfo : planInfo
  );
  // set `unspecified` component, etc., from entity info
  const unspecified = entityInfo.unspecified;
  const nouns = entityInfo.nouns;

  // define data and metadata for table
  const [data, setData] = useState(null);

  const [metadata, setMetadata] = useState(null);

  // define filters
  const [filters, setFilters] = useState({});

  // flag for whether the download button should say loading or not
  const [buttonLoading, setButtonLoading] = useState(false);

  // min and max dates for date range pickers dynamically determined by data
  const [minMaxStartDate, setMinMaxStartDate] = useState({
    min: undefined,
    max: undefined
  });
  const [minMaxEndDate, setMinMaxEndDate] = useState({
    min: undefined,
    max: undefined
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
  const getData = async ({ filters: {}, entityInfoForQuery }) => {
    const method = Object.keys(filters).length === 0 ? "get" : "post";
    const initColumns = entityInfoForQuery.getColumns({ metadata: {} });

    const queries = {
      instances: entityInfoForQuery.dataQuery({ method, filters }),
      metadata: Metadata({
        method: "get",
        fields: initColumns.map(d => {
          if (!d.dataField.includes(".")) return docType + "." + d.dataField;
          else return d.dataField;
        }),
        entity_class_name: nouns.s
      })
    };

    // TODO generalize to plans
    queries.optionsets = OptionSet({
      method: "get",
      fields: entityInfoForQuery.filterDefs
        .map(d => Object.values(d).map(dd => dd))
        .flat()
        .filter(d => !d.field.startsWith("date"))
        .map(d => {
          return d.entity_name + "." + d.field;
        }),
      entity_name: entityInfoForQuery.nouns.s
    });

    // execute queries and collate results
    const results = await execute({
      queries
    });

    // set data and metadata with results
    setData(results.instances.data);
    setMetadata(results.metadata.data);

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
      max: new Date(moment(policyDatesStart[policyDatesStart.length - 1]).utc())
    };
    const newMinMaxEndDate = {
      min: new Date(moment(policyDatesEnd[0]).utc()),
      max: new Date(moment(policyDatesEnd[policyDatesEnd.length - 1]).utc())
    };

    setMinMaxStartDate(newMinMaxStartDate);
    setMinMaxEndDate(newMinMaxEndDate);

    // if page is first initializing, also retrieve filter optionset values for
    // non-date filters
    // TODO move this out of main code if possible
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
            max: undefined
          };
        }
      }
    });
    setFilterDefs(newFilterDefs);
    setColumns(
      entityInfoForQuery.getColumns({ metadata: results.metadata.data })
    );
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
    setColumns(null);
    setData(null);
    setFilterDefs(null);
    setFilters({});

    const newEntityInfo = docType === "policy" ? policyInfo : planInfo;
    setEntityInfo(newEntityInfo);
    getData({
      filters: {},
      entityInfoForQuery: newEntityInfo,
      initializingForQuery: true
    });
  }, [docType]);

  // // when entity info updated, update cols, data, and filter defs
  // useEffect(() => {
  //   console.log("Entity info is: " + entityInfo.nouns.s);
  //
  //   // set data
  //   getData(filters);
  // }, [entityInfo]);

  // // when filters change, get data
  // useEffect(() => {
  //   console.log("Filters changed, getting new data");
  //   console.log(entityInfo);
  //
  //   // set data
  //   getData(filters);
  // }, [filters]);

  // define which table component to show based on selected doc type
  const getTable = ({ docType }) => {
    if (columns === null || data === null || filterDefs === null) return null;
    else return <Table {...{ columns, data }} />;
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
              label: (
                <React.Fragment>
                  <button
                    className={classNames(styles.downloadBtn, {
                      [styles.loading]: buttonLoading
                    })}
                    onClick={e => {
                      e.stopPropagation();
                      setButtonLoading(true);
                      Export({ method: "post", filters }).then(d =>
                        setButtonLoading(false)
                      );
                    }}
                  >
                    <img src={downloadSvg} />
                    <div>
                      {!buttonLoading && table && (
                        <React.Fragment>
                          <span>
                            Download {isEmpty(filters) ? "all" : "filtered"}{" "}
                            {nouns.p.toLowerCase()}
                          </span>
                          <br />
                          <span>
                            {comma(data.length)} record
                            {data.length === 1 ? "" : "s"}
                          </span>
                        </React.Fragment>
                      )}
                      {buttonLoading && (
                        <React.Fragment>
                          <span>Downloading data</span>
                          <br />
                          <span>Please wait...</span>
                        </React.Fragment>
                      )}
                    </div>
                  </button>
                </React.Fragment>
              ),
              noCollapse: false,
              content: (
                <React.Fragment>
                  <RadioToggle
                    label={"View"}
                    choices={[
                      { name: "Policies", value: "policy" },
                      {
                        name: "Plans",
                        value: "plan"
                      }
                    ]}
                    curVal={docType}
                    callback={setDocType}
                    horizontal={true}
                    selectpicker={false}
                    setInfoTooltipContent={setInfoTooltipContent}
                  />
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
              )
            }}
          />
          {table}
          {!table && <div style={{ height: "900px" }} />}
        </React.Fragment>
      )}
    </div>
  );
};

export default Data;
