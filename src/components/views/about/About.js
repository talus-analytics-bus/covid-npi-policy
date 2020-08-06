import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";
import styles from "./about.module.scss";

// content
import Documentation from "./content/Documentation";

// local components
import { AccessibilityNote } from "../../common";

// assets
import logo from "../../../assets/images/logo.svg";
import talus from "../../../assets/images/logo-talus.png";
import georgetown from "../../../assets/images/logo-georgetown.png";
import nti from "../../../assets/images/logo-nti.png";
import can from "../../../assets/images/logo-can.png";

const About = ({ setLoading, setPage, initTab, ...props }) => {
  // display text and image for each contributor
  const contributors = [
    {
      imgSrc: georgetown,
      text: (
        <>
          The Georgetown University Center for Global Health Science and
          Security (GHSS) led the policy research effort, providing health
          policy and legal expertise, including policy and plan data collection,
          policy review, and legal review.
        </>
      ),
      url: "https://ghss.georgetown.edu/",
      key: "georgetown",
    },
    {
      imgSrc: talus,
      url: "http://talusanalytics.com/",
      key: "talus",
      text: (
        <>
          Talus Analytics developed the taxonomy and ontologies for policies and
          plans, integration with the epidemiological data and analysis, and
          designed, built, and maintain the interactive AMP site.
        </>
      ),
    },
    {
      imgSrc: nti,
      text: (
        <>
          The Nuclear Threat Initiative (NTI) provided funding for AMP, as well
          as contributing subject matter expertise and project leadership to the
          overall COVID Local project.
        </>
      ),
      url: "https://www.nti.org/about/biosecurity/",
      key: "nti",
    },
    {
      imgSrc: can,
      text: (
        <>
          COVID Act Now provides access to technical infrastructure for the
          COVID-19 disease transmission model used in the AMP Policy Model
          <i> (COMING SOON)</i>. This model was developed in a collaborative
          effort between GHSS, Talus Analytics, and COVID Act Now.
        </>
      ),
      url: "https://covidactnow.org/",
      key: "can",
    },
  ];

  // define tabs and content
  const tabs = [
    {
      name: "Documentation",
      slug: "doc",
      content: (
        <div>
          <div>
            <div className={styles.downloads}>
              <a
                className={classNames(styles.download, styles.mini)}
                href={
                  process.env.PUBLIC_URL +
                  "/export/COVID AMP data dictionary.xlsx"
                }
              >
                <button>
                  <i className={"material-icons"}>get_app</i>Download data
                  dictionary
                </button>
              </a>
              <a
                className={classNames(styles.download, styles.mini)}
                target="_blank"
                href={
                  process.env.PUBLIC_URL +
                  "/export/COVID AMP documentation 071620.pdf"
                }
              >
                <button>
                  <i className={"material-icons"}>get_app</i>Download as PDF
                </button>
              </a>
            </div>
            <Documentation />
          </div>
        </div>
      ),
    },
    {
      name: "What is COVID AMP?",
      slug: "amp",
      content: (
        <>
          <section>
            <p>
              The COVID Analysis and Mapping of Policies (AMP) visualization
              tool is a comprehensive database of policies and plans to address
              the COVID-19 pandemic. Decision-makers can use COVID AMP’s
              user-friendly interface to easily identify effective policies and
              plans to reduce the impacts of the COVID-19 pandemic.
            </p>
            <p>
              <i>
                COVID AMP is part of the COVID-Local suite of free resources
                developed for local decision-makers who are working to keep
                their communities safe during the COVID-19 pandemic. The COVID
                AMP library includes policies and plans published by subnational
                governments or private and non-profit organizations, in addition
                to those released by national governments.
              </i>
            </p>
          </section>
          <section>
            <h3 className={styles.subtitle}>Contributors</h3>
            <div className={styles.articles}>
              {contributors.map(d => (
                <article>
                  <a href={d.url} target="_blank">
                    <div>
                      <img src={d.imgSrc} />
                    </div>
                  </a>
                  <p>{d.text}</p>
                </article>
              ))}
            </div>
          </section>
        </>
      ),
    },
  ];
  const [tab, setTab] = useState(initTab);
  useEffect(() => {
    setLoading(false);
    setPage("about");
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    setTab(initTab);
  }, [initTab]);

  return (
    <div className={styles.about}>
      <h2 className={styles.title}>About</h2>
      <AccessibilityNote />
      <div className={styles.tabs}>
        {tabs.map(d => (
          <Link to={"/about/" + d.slug}>
            <button
              key={d.slug}
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
            <div key={d.slug} className={styles.content}>
              {d.content}
            </div>
          )
      )}
    </div>
  );
};

export default About;
