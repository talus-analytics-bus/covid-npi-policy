import React from "react";
import { useState, useEffect } from "react";
import moment from "moment";
import axios from "axios";

// common compoments
import { FilterSet, Table } from "../../common";
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
const Data = ({ setLoading }) => {
  const [initializing, setInitializing] = useState(true);

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

  // define non-date filters
  // TODO make simpler, probably removing the `field` key
  const [filterDefs, setFilterDefs] = useState({
    level: {
      entity_name: "Place",
      field: "level",
      label: "Organizational level"
    },
    area1: {
      entity_name: "Place",
      field: "area1",
      label: "State"
    },
    // loc: {
    //   entity_name: "Place",
    //   field: "loc",
    //   label: "Specific location"
    // },
    primary_ph_measure: {
      entity_name: "Policy",
      field: "primary_ph_measure",
      label: "Policy category"
    },
    ph_measure_details: {
      entity_name: "Policy",
      field: "ph_measure_details",
      label: "Policy type"
    },
    date_start_effective: {
      entity_name: "Policy",
      field: "date_start_effective",
      label: "Policy effective start date",
      dateRange: true,
      minMaxDate: { min: undefined, max: undefined }
    },
    date_end_actual: {
      entity_name: "Policy",
      field: "date_end_actual",
      label: "Policy end date",
      dateRange: true,
      minMaxDate: { min: undefined, max: undefined }
    }
  });

  const unspecified = (
    <span className={styles.unspecified}>{"None available"}</span>
  );

  const [columns, setColumns] = useState([
    {
      dataField: "place.level",
      header: "Level of government / Organization level",
      sort: true
    },
    {
      dataField: "place.loc",
      header: "Country / Specific location",
      sort: true
    },
    {
      dataField: "file",
      header: "Link to policy",
      sort: true,
      formatter: (row, cell) => {
        if (cell.file && cell.file.length > 0) {
          return cell.file.map(d => {
            if (d.filename && d.filename !== "")
              return (
                <a
                  target="_blank"
                  href={`${API_URL}${d.filename.replace("#", "")}`}
                >
                  <i className={"material-icons"}>insert_drive_file</i>
                  <span>Download policy</span>
                </a>
              );
            else if (d.data_source && d.data_source !== "")
              return (
                <a target="_blank" href={d.data_source}>
                  <i className={"material-icons"}>link</i>
                  <span>External site</span>
                </a>
              );
            else
              return (
                <span className={styles.unspecified}>{"None available"}</span>
              );
          });
        } else {
          return "None";
        }
      }
    },
    {
      dataField: "primary_ph_measure",
      header: "Policy category",
      sort: true
    },
    {
      dataField: "ph_measure_details",
      header: "Policy type",
      sort: true
    },
    {
      dataField: "desc",
      header: "Policy description",
      sort: true
    },
    {
      dataField: "date_start_effective",
      header: "Policy effective start date",
      sort: true,
      formatter: v =>
        v !== null ? moment(v).format("MMM D, YYYY") : unspecified
    },
    {
      dataField: "date_end_actual",
      header: "Policy end date",
      sort: true,
      formatter: v =>
        v !== null ? moment(v).format("MMM D, YYYY") : unspecified
    }
  ]);

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
        fields: Object.values(filterDefs)
          .filter(d => !d.field.startsWith("date"))
          .map(d => {
            return d.entity_name + "." + d.field;
          }),
        entity_name: "Policy"
      });

      // set options for filters
      const newFilterDefs = { ...filterDefs };
      for (const [k, v] of Object.entries(filterDefs)) {
        if (!k.startsWith("date")) filterDefs[k].items = results[k];
        else continue;
      }

      // set min/max date range for daterange filters
      newFilterDefs.date_start_effective.minMaxDate = newMinMaxStartDate;
      newFilterDefs.date_end_actual.minMaxDate = newMinMaxEndDate;
      setFilterDefs(newFilterDefs);
    }
  };

  // on initial page load, get all data and filter optionset values
  useEffect(getData, []);

  // when filters are changed, retrieve filtered data
  useEffect(() => {
    if (!initializing) getData(filters);
  }, [filters]);

  useEffect(() => {
    if (metadata !== null) {
      const newColumns = [...columns];
      newColumns.forEach(d => {
        const key = d.dataField.includes(".")
          ? d.dataField
          : "policy." + d.dataField;
        d.definition = metadata[key].definition || "";

        // use only the first sentence of the definition
        d.definition = d.definition.split(".")[0];
      });
      setColumns(newColumns);
    }
  }, [metadata]);

  useEffect(() => {
    if (data !== null) setLoading(false);
  }, [data]);

  if (initializing) return <div />;
  else
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
              non-profit organizations. For simple search, each policy or plan
              has been categorized by the type of measure, in addition to
              implementation date and authorizing agency. In addition, policies
              can be identified by legal authority and plans by type of
              organization. Where available, PDFs or links to the original
              document or notice are included.
            </p>
          </div>
        </div>
        <Drawer
          {...{
            label: (
              <React.Fragment>
                <h2>Policy and plan database</h2>
                <button
                  className={classNames(styles.downloadBtn, {
                    [styles.loading]: buttonLoading
                  })}
                  onClick={() => {
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
                          Download {isEmpty(filters) ? "all" : "filtered"} data
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
            noCollapse: true,
            content: (
              <React.Fragment>
                <span>
                  Select filters to apply to data.{" "}
                  {Object.keys(filters).length > 0 && (
                    <button onClick={() => setFilters({})}>
                      Clear filters
                    </button>
                  )}
                </span>
                <FilterSet {...{ filterDefs, filters, setFilters }} />
              </React.Fragment>
            )
          }}
        />
        <Table {...{ columns, data }} />
      </div>
    );
};

export default Data;
