import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";
import styles from "./about.module.scss";

// assets
import logo from "../../../assets/images/logo.svg";
import talus from "../../../assets/images/logo-talus.png";
import georgetown from "../../../assets/images/logo-georgetown.png";
import nti from "../../../assets/images/logo-nti.svg";
import can from "../../../assets/images/logo-can.png";

const About = ({ setLoading, setPage, initTab, ...props }) => {
  const contributors = [
    {
      imgSrc: nti,
      text: (
        <>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam finibus
          ipsum et magna condimentum, eu congue eros mattis. Morbi efficitur
          nibh a sem sagittis, in interdum metus lacinia. Curabitur tristique
          dui ut urna rutrum, ac condimentum lacus consectetur. Ut dignissim sit
          amet ex a pellentesque. Fusce sit amet suscipit massa, vitae luctus
          risus.
        </>
      ),
      url: "",
      key: "nti"
    },
    {
      imgSrc: georgetown,
      text: (
        <>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam finibus
          ipsum et magna condimentum, eu congue eros mattis. Morbi efficitur
          nibh a sem sagittis, in interdum metus lacinia. Curabitur tristique
          dui ut urna rutrum, ac condimentum lacus consectetur. Ut dignissim sit
          amet ex a pellentesque. Fusce sit amet suscipit massa, vitae luctus
          risus.
        </>
      ),
      url: "",
      key: "georgetown"
    },
    {
      imgSrc: can,
      text: (
        <>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam finibus
          ipsum et magna condimentum, eu congue eros mattis. Morbi efficitur
          nibh a sem sagittis, in interdum metus lacinia. Curabitur tristique
          dui ut urna rutrum, ac condimentum lacus consectetur. Ut dignissim sit
          amet ex a pellentesque. Fusce sit amet suscipit massa, vitae luctus
          risus.
        </>
      ),
      url: "",
      key: "can"
    },
    {
      imgSrc: talus,
      text: (
        <>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam finibus
          ipsum et magna condimentum, eu congue eros mattis. Morbi efficitur
          nibh a sem sagittis, in interdum metus lacinia. Curabitur tristique
          dui ut urna rutrum, ac condimentum lacus consectetur. Ut dignissim sit
          amet ex a pellentesque. Fusce sit amet suscipit massa, vitae luctus
          risus.
        </>
      ),
      url: "",
      key: "talus"
    }
  ];
  const tabs = [
    {
      name: "What is COVID AMP?",
      slug: "amp",
      content: (
        <>
          <img src={logo} />
          <section>
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
            <p>
              <i>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam
                finibus ipsum et magna condimentum, eu congue eros mattis. Morbi
                efficitur nibh a sem sagittis, in interdum metus lacinia.
                Curabitur tristique dui ut urna rutrum, ac condimentum lacus
                consectetur. Ut dignissim sit amet ex a pellentesque. Fusce sit
                amet suscipit massa, vitae luctus risus.
              </i>
            </p>
          </section>
          <section>
            <h3 className={styles.subtitle}>Contributors</h3>
            <div className={styles.articles}>
              {contributors.map(d => (
                <article>
                  <a href={d.url}>
                    <img src={d.imgSrc} />
                  </a>
                  <p>{d.text}</p>
                </article>
              ))}
            </div>
          </section>
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
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    setTab(initTab);
  }, [initTab]);

  return (
    <>
      <h2 className={styles.title}>About</h2>
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
    </>
  );
};

export default About;
