import React from "react";
import { useState, useEffect } from "react";
import styles from "./data.module.scss";
import moment from "moment";

// common compoments
import { Table } from "../../common";
import Drawer from "../../layout/drawer/Drawer.js";
import { Policy, execute } from "../../misc/Queries.js";

const Data = () => {
  const [data, setData] = useState(null);
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

  const getData = async () => {
    const results = await execute({
      queries: {
        policies: Policy({ method: "get" })
      }
    });
    setData(results.policies.data);
  };

  useEffect(getData, []);

  if (data === null) return <div />;
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
        <Drawer {...{ label: <h2>Policy library</h2> }} />
        <Table {...{ columns, data }} />
      </div>
    );
};

export default Data;
