import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";
import styles from "./about.module.scss";

// assets
import logo from "../../../assets/images/logo.svg";

const About = ({ setLoading, setPage, initTab, ...props }) => {
  const tabs = [
    {
      name: "What is COVID AMP?",
      slug: "amp",
      content: (
        <>
          <img src={logo} />
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
          <p>
            <i>TODO: Second paragraph.</i>
          </p>
          <p>
            <i>TODO: Third paragraph.</i>
          </p>
          <h3>Contributors</h3>
          <p>
            <i>TODO: Describe the four contributors to COVID AMP.</i>
          </p>
        </>
      )
    },
    {
      name: "Documentation",
      slug: "doc",
      content: (
        <p>
          <h3>Documentation</h3>
          <p>
            <i>Documentation coming soon.</i>
          </p>
          <p>
            <i>
              TODO: Add data documentation PDF download and embedded text
              document.
            </i>
          </p>
          <p>
            <i>TODO: Add data dictionary XLSX download.</i>
          </p>
        </p>
      )
    }
  ];
  const [tab, setTab] = useState(initTab);
  useEffect(() => {
    setLoading(false);
    setPage("about");
  }, []);

  return (
    <>
      <h2 className={styles.title}>About</h2>
      <div className={styles.tabs}>
        {tabs.map(d => (
          <Link to={"/about/" + d.slug}>
            <button
              key={d.name}
              onClick={() => setTab(d.slug)}
              className={classNames({ [styles.active]: d.slug === tab })}
            >
              {d.name}
            </button>
          </Link>
        ))}
      </div>
      {tabs.map(
        d =>
          d.slug === tab && (
            <div key={d.name} className={styles.content}>
              {d.content}
            </div>
          )
      )}
    </>
  );
};

export default About;
