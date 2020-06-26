import React, { useState, useEffect, useRef } from "react";
import classNames from "classnames";
import styles from "./documentation.module.scss";

// assets
import logo from "../../../assets/images/logo.svg";

const Documentation = ({ setLoading, setPage, ...props }) => {
  const [initialized, setInitialized] = useState(false);
  const getData = async () => {
    return [];
  };
  useEffect(() => {
    setLoading(false);
    setPage("documentation");
    if (!initialized) {
      getData();
    }
  }, []);

  return (
    <>
      <h2 className={styles.title}>Documentation</h2>
      <div>Content placeholder</div>
    </>
  );
};

export default Documentation;
