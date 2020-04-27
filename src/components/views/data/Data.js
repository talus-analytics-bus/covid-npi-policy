import React from "react";
import { useState, useEffect } from "react";
import styles from "./data.module.scss";
import moment from "moment";

// common compoments
import { FilterSet, Table } from "../../common";
import Drawer from "../../layout/drawer/Drawer.js";
import { Policy, execute } from "../../misc/Queries.js";

const Data = () => {
  const [initializing, setInitializing] = useState(true);

  // define data for table
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState(null);

  // define non-date filters
  const [filterDefs, setFilterDefs] = useState({
    primary_ph_measure: {
      field: "primary_ph_measure",
      label: "Policy category",
      getItems: async () => {
        return [
          { id: 0, label: "Social distancing", value: "Social distancing" }
        ];
      }
    },
    ph_measure_details: {
      field: "ph_measure_details",
      label: "Policy type",
      getItems: async () => {
        return [{ id: 0, label: "School closures", value: "School closures" }];
      }
    }
    // test_attribute: {
    //   field: "test_attribute",
    //   label: "Test attribute",
    //   getItems: async () => {
    //     return [
    //       { id: 0, label: "CJE", value: "CJE" },
    //       { id: 1, label: "Test 2", value: "Test 2" },
    //       { id: 2, label: "Test 3", value: "Test 3" },
    //       { id: 3, label: "Test 4", value: "Test 4" }
    //     ];
    //   }
    // }
  });
  const columns = [
    {
      dataField: "auth_entity.level",
      text: "Level of government / Organization level",
      sort: true
    },
    {
      dataField: "auth_entity.desc",
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

  const getData = async (filters = null) => {
    const method = filters === null ? "get" : "post";
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
      const queries = {};
      for (const [k, v] of Object.entries(filterDefs)) {
        queries[k] = await v.getItems();
      }
      const results = await execute({ queries });
      console.log("results");
      console.log(results);
      const newFilterDefs = { ...filterDefs };

      for (const [k, v] of Object.entries(filterDefs)) {
        filterDefs[k].items = results[k];
      }
      setFilterDefs(newFilterDefs);
      console.log("newFilterDefs");
      console.log(newFilterDefs);
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
                <FilterSet {...{ filterDefs, filters, setFilters }} />
                {filters !== null && (
                  <button onClick={() => setFilters(null)}>
                    Clear filters
                  </button>
                )}
              </React.Fragment>
            )
          }}
        />
        <Table {...{ columns, data }} />
      </div>
    );
};

export default Data;
