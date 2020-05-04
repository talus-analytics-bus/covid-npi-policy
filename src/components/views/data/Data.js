import React from "react";
import { useState, useEffect } from "react";
import styles from "./data.module.scss";
import moment from "moment";

// common compoments
import { FilterSet, Table } from "../../common";
import Drawer from "../../layout/drawer/Drawer.js";
import { Policy, OptionSet, execute } from "../../misc/Queries.js";

const Data = () => {
  const [initializing, setInitializing] = useState(true);

  // define data for table
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({});
  console.log(" filters");
  console.log(filters);

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
    policy_type: {
      entity_name: "Policy",
      field: "policy_type",
      label: "Legal type"
    }
  });
  const columns = [
    {
      dataField: "place.level",
      text: "Level of government / Organization level",
      sort: true
    },
    {
      dataField: "place.loc",
      text: "Country / Specific location",
      sort: true
    },
    {
      dataField: "primary_ph_measure",
      text: "Policy category",
      sort: true
    },
    {
      dataField: "ph_measure_details",
      text: "Policy type",
      sort: true
    },
    {
      dataField: "desc",
      text: "Policy description",
      sort: true
    },
    {
      dataField: "date_issued",
      text: "Policy issued date",
      sort: true,
      formatter: v => moment(v).format("MMM D, YYYY")
    }
  ];

  const getData = async (filters = {}) => {
    const method = Object.keys(filters).length === 0 ? "get" : "post";
    const results = await execute({
      queries: {
        policies: Policy({ method, filters })
      }
    });
    setData(results.policies.data);
    // if page is first initializing, also retrieve filter optionset values for
    // non-date filters
    // TODO move this out of main code if possible
    if (initializing) {
      setInitializing(false);
      const results = await OptionSet({
        method: "get",
        fields: Object.values(filterDefs).map(d => {
          return d.entity_name + "." + d.field;
        }),
        entity_name: "Policy"
      });
      const newFilterDefs = { ...filterDefs };

      for (const [k, v] of Object.entries(filterDefs)) {
        filterDefs[k].items = results[k];
      }
      setFilterDefs(newFilterDefs);
    }
  };

  // on initial page load, get all data and filter optionset values
  useEffect(getData, []);

  // when filters are changed, retrieve filtered data
  useEffect(() => {
    if (!initializing) getData(filters);
  }, [filters]);

  if (initializing) return <div />;
  else
    return (
      <div className={styles.data}>
        <h1>
          Welcome to COVID
          <br />
          Policy Tracker
        </h1>
        <div className={styles.columnText}>
          <p>
            The COVID Policy Tracker provides access to a comprehensive list of
            policies implemented at all levels of government globally to address
            the COVID-19 pandemic. In many cases, subnational governments have
            led the COVID-19 response. For simple search, each policy has been
            categorized into the type of measure taken, in addition to
            implementation date and authorizing agency. In addition, policies
            can be identified by legal authority, when available, for
            implementing each policy listed. Where available, PDFs or links to
            the policies are included.
          </p>
          <p>
            Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
            nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
            volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
            ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo
            consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate
            velit esse molestie consequat, vel illum dolore eu feugiat nulla
            facilisis at vero eros et accumsan et iusto odio dignissim qui
            blandit praesent luptatum zzril delenit augue duis dolore te feugait
            nulla facilisi.
          </p>
        </div>
        <Drawer
          {...{
            label: <h2>Policy library</h2>,
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
