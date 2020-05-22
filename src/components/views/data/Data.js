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
const API_URL = process.env.REACT_APP_API_URL;

// primary data viewing and download page
const Data = ({ setLoading, setInfoTooltipContent }) => {
  const [initializing, setInitializing] = useState(true);
  const [docType, setDocType] = useState("policy");

  // get nouns to use from doc type
  const getNouns = docType => {
    if (docType === "policy") {
      return { s: "Policy", p: "Policies" };
    } else {
      return { s: "Plan", p: "Plans" };
    }
  };
  const nouns = getNouns(docType);

  // define data and metadata for table
  const [data, setData] = useState(null);
  const [metadata, setMetadata] = useState(null);

  // define filters
  // TODO parse by policy/plan
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
  const [filterDefs, setFilterDefs] = useState([
    {
      level: {
        entity_name: "Place",
        field: "level",
        label: "Affected level of government"
      }
    },
    {
      iso3: {
        entity_name: "Place",
        field: "iso3",
        label: "Country"
      },
      area1: {
        entity_name: "Place",
        field: "area1",
        label: "State / Province",
        withGrouping: true,
        primary: "iso3",
        disabledText: "Choose a country"
      },
      area2: {
        entity_name: "Place",
        field: "area2",
        label: "Locality (county, city, ...)",
        withGrouping: true,
        primary: "area1",
        disabledText: "Choose a state / province"
      }
    },
    {
      primary_ph_measure: {
        entity_name: "Policy",
        field: "primary_ph_measure",
        label: "Policy category"
      },
      ph_measure_details: {
        entity_name: "Policy",
        field: "ph_measure_details",
        label: "Policy sub-category",
        withGrouping: true,
        primary: "primary_ph_measure",
        disabledText: "Choose a policy category"
      }
    },
    {
      dates_in_effect: {
        entity_name: "Policy",
        field: "dates_in_effect",
        label: "Dates policy in effect",
        dateRange: true,
        minMaxDate: { min: undefined, max: undefined }
      }
    }
  ]);

  const unspecified = (
    <span className={styles.unspecified}>{"None available"}</span>
  );

  const [columns, setColumns] = useState([
    {
      dataField: "place.level",
      header: "Affected level of government",
      sort: true
    },
    {
      dataField: "place.loc",
      header: "Affected location",
      sort: true
    },
    {
      dataField: "primary_ph_measure",
      header: "Policy category",
      sort: true
    },
    // {
    //   dataField: "ph_measure_details",
    //   header: "Policy sub-category",
    //   sort: true
    // },
    {
      dataField: "desc",
      header: "Policy description",
      sort: true,
      formatter: v => {
        return <ShowMore text={v} />;
      }
    },
    {
      dataField: "date_start_effective",
      header: "Policy effective start date",
      sort: true,
      formatter: v =>
        v !== null ? moment(v).format("MMM D, YYYY") : unspecified
    },
    // {
    //   dataField: "date_end_actual_or_anticipated",
    //   header: "Policy end date",
    //   sort: true,
    //   sortFunc: (axx, bxx, order, dataField, a, b) => {
    //     const getDateValue = d => {
    //       if (d.date_end_actual !== null) return moment(d.date_end_actual);
    //       else if (d.date_end_anticipated !== null)
    //         return moment(d.date_end_anticipated);
    //       else return -99999;
    //     };
    //     const aDate = getDateValue(a);
    //     const bDate = getDateValue(b);
    //     if (order === "asc") {
    //       return aDate - bDate;
    //     }
    //     return bDate - aDate; // desc
    //   },
    //   formatter: (v, row) => {
    //     const hasActual = row.date_end_actual !== null;
    //     if (hasActual) return moment(row.date_end_actual).format("MMM D, YYYY");
    //     else {
    //       const hasAnticipated = row.date_end_anticipated !== null;
    //       if (hasAnticipated) {
    //         return (
    //           moment(row.date_end_anticipated).format("MMM D, YYYY") +
    //           " (anticipated)"
    //         );
    //       } else return unspecified;
    //     }
    //   }
    // },
    {
      dataField: "file",
      header: "Link",
      sort: true,
      formatter: (row, cell) => {
        const icons = cell.file.map(d => {
          if (d.filename && d.filename !== "") {
            return (
              <div className={styles.linkIcon}>
                <a
                  target="_blank"
                  href={`${API_URL}${d.filename.replace("#", "")}`}
                >
                  <i className={"material-icons"}>insert_drive_file</i>
                </a>
              </div>
            );
          } else if (d.data_source && d.data_source !== "") {
            return (
              <div className={styles.linkIcon}>
                <a target="_blank" href={d.data_source}>
                  <i className={"material-icons"}>link</i>
                </a>
              </div>
            );
          } else return unspecified;
        });
        if (cell.file && cell.file.length > 0) {
          return <div className={styles.linkIcons}>{icons}</div>;
        } else {
          return unspecified;
        }
      }
    }
  ]);

  /**
   * Get data for page
   * @method getData
   * @param  {Object}  [filters={}] [description]
   * @return {Promise}              [description]
   */
  const getData = async (filters = {}) => {
    const method = Object.keys(filters).length === 0 ? "get" : "post";
    const results = await execute({
      queries: {
        policies: Policy({
          method,
          filters,
          fields: [
            "id",
            "place",
            "primary_ph_measure",
            "ph_measure_details",
            "desc",
            "date_start_effective",
            "date_end_actual",
            "date_end_anticipated",
            "file"
          ]
        }),
        metadata: Metadata({
          method: "get",
          fields: columns.map(d => {
            if (!d.dataField.includes(".")) return "policy." + d.dataField;
            else return d.dataField;
          })
        })
      }
    });
    setData(results.policies.data);
    setMetadata(results.metadata.data);

    // define min/max range of daterange pickers
    // TODO modularize and reuse repeated code
    const policyDatesStart = results.policies.data
      .map(d => d.date_start_effective)
      .filter(d => d)
      .sort();
    const policyDatesEnd = results.policies.data
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
    if (initializing) {
      setInitializing(false);
      const results = await OptionSet({
        method: "get",
        fields: filterDefs
          .map(d => Object.values(d).map(dd => dd))
          .flat()
          .filter(d => !d.field.startsWith("date"))
          .map(d => {
            return d.entity_name + "." + d.field;
          }),
        entity_name: "Policy"
      });

      // set options for filters
      const newFilterDefs = [...filterDefs];
      newFilterDefs.forEach(d => {
        for (const [k, v] of Object.entries(d)) {
          if (!k.startsWith("date")) d[k].items = results[k];
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
    }
  };

  // on initial page load, get all data and filter optionset values
  useEffect(getData, []);

  // when filters are changed, retrieve filtered data
  useEffect(() => {
    if (!initializing) getData(filters);
  }, [filters]);

  // when metadata are retrieved, update columns with definitions
  useEffect(() => {
    if (metadata !== null) {
      const newColumns = [...columns];
      newColumns.forEach(d => {
        if (d.dataField === "file") {
          d.definition = "PDF download of or external link to policy";
          return;
        }
        const key = d.dataField.includes(".")
          ? d.dataField
          : "policy." + d.dataField;
        d.definition = metadata[key] ? metadata[key].definition || "" : "";

        // use only the first sentence of the definition
        d.definition = d.definition.split(".")[0];
      });
      setColumns(newColumns);
    }
  }, [metadata]);

  // when data are loaded, set loading flag to false (controlled in App.js)
  useEffect(() => {
    if (data !== null) setLoading(false);
  }, [data]);

  // define which table component to show based on selected doc type
  const getTable = ({ docType }) => {
    switch (docType) {
      case "policy":
        return <Table {...{ columns, data }} />;
      case "plan":
      default:
        return <div />;
    }
  };
  const table = getTable({ docType });

  return (
    <div className={styles.data}>
      <div className={styles.header}>
        <h1>Welcome to COVID AMP policy and plan database</h1>
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
      {!initializing && (
        <React.Fragment>
          <Drawer
            {...{
              label: (
                <React.Fragment>
                  <h2>Policy and plan database</h2>
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
                      {!buttonLoading && (
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
                        value: "plan",
                        tooltip:
                          "Plans are currently being added to the database and are not yet available.",
                        disabled: true
                      }
                    ]}
                    curVal={docType}
                    callback={setDocType}
                    horizontal={true}
                    selectpicker={false}
                    setInfoTooltipContent={setInfoTooltipContent}
                  />
                  <div>
                    Select filters to apply to {nouns.p.toLowerCase()}.{" "}
                    {Object.keys(filters).length > 0 && (
                      <button onClick={() => setFilters({})}>
                        Clear filters
                      </button>
                    )}
                  </div>
                  <FilterSet {...{ filterDefs, filters, setFilters }} />
                </React.Fragment>
              )
            }}
          />
          {table}
        </React.Fragment>
      )}
    </div>
  );
};

export default Data;
