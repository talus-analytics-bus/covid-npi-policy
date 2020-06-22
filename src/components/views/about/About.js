import React, { useState, useEffect, useRef } from "react";
import classNames from "classnames";
import styles from "./about.module.scss";

// assets
import logo from "../../../assets/images/logo.svg";

const About = ({ setLoading, setPage, ...props }) => {
  const tabs = [
    {
      name: "What is COVID AMP?",
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
        </>
      )
    },
    {
      name: "Acknowledgements",
      content: (
        <p>
          <i>Acknowledgements coming soon.</i>
        </p>
      )
    }
  ];
  const [tab, setTab] = useState(tabs[0].name);
  useEffect(() => {
    setLoading(false);
    setPage("about");
  }, []);

  return (
    <>
      <h2 className={styles.title}>About</h2>
      <div className={styles.tabs}>
        {tabs.map(d => (
          <button
            key={d.name}
            onClick={() => setTab(d.name)}
            className={classNames({ [styles.active]: d.name === tab })}
          >
            {d.name}
          </button>
        ))}
      </div>
      {tabs.map(
        d =>
          d.name === tab && (
            <div key={d.name} className={styles.content}>
              {d.content}
            </div>
          )
      )}
    </>
  );
};

export default About;