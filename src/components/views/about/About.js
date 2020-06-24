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
      url: "https://www.nti.org/about/biosecurity/",
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
      url: "https://ghss.georgetown.edu/",
      key: "georgetown"
    },
    {
      imgSrc: talus,
      url: "http://talusanalytics.com/",
      key: "talus",
      text: (
        <>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam finibus
          ipsum et magna condimentum, eu congue eros mattis. Morbi efficitur
          nibh a sem sagittis, in interdum metus lacinia. Curabitur tristique
          dui ut urna rutrum, ac condimentum lacus consectetur. Ut dignissim sit
          amet ex a pellentesque. Fusce sit amet suscipit massa, vitae luctus
          risus.
        </>
      )
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
      url: "https://covidactnow.org/",
      key: "can"
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
        <div>
          <div>
            <h2>Overview&nbsp;</h2>
            <p>
              The COVID Analysis and Mapping of Policies (AMP) is part of the
              COVID-Local suite of free resources developed for local
              decision-makers. The COVID AMP Policy and Plan Database includes a
              library of polices from US states and the District of Columbia, US
              local governments (counties, cities) and national governments
              globally.&nbsp;&nbsp;
            </p>
            <p>
              COVID AMP is an on-going research effort with data collection
              performed by researchers at the Georgetown University Center for
              Global Health Science and Security. As of June 2020, data are most
              complete for US states. Additional work is in progress to expand
              both to county-level data collection across the US and
              country-level data globally. In addition, a dataset of
              COVID-19-related plans published by US states and other
              organizations is also being collated and will be available on the
              site.&nbsp;
            </p>
            <p>The site includes:&nbsp;</p>
            <ol>
              <li>
                A searchable, filterable database of all policies and plans in
                the dataset. The complete dataset can be downloaded in an Excel
                file format directly from the site. If you are interested in
                establishing an API or other direct access, please contact us
                at&nbsp;
                <a href="http://ihrcosting@georgetown.org">
                  ihrcosting@georgetown.org
                </a>
                .
              </li>
              <li>
                An interactive policy map providing geospatial visualization of
                the policies implemented over time. Policies can be viewed by
                &ldquo;Distancing level&rdquo; (see Methods below for detailed
                information about these categories) or by key policy types. All
                policy maps include reference COVID-19 case counts, over time,
                either as new cases in the last 7 days or cumulative cases.
              </li>
              <li>
                <em>COMING SOON:&nbsp;</em>An interactive tool to explore the
                intersection between policies and caseload for each US state.
                The tool also provides the ability to:
                <ol>
                  <li>
                    Compare the effect of not having implemented any policies
                  </li>
                  <li>
                    Evaluate new policy options given current conditions for
                    each state
                  </li>
                </ol>
              </li>
            </ol>
            <p>
              A comprehensive data dictionary defining the structure and
              metadata for the policy dataset can be downloaded by clicking the
              button below.
              <a
                className={styles.download}
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
            </p>
            <h2>Annotated Policy Library</h2>
            <h3>Data coding process</h3>
            <p>
              To collect the data, the team first developed a custom data
              taxonomy and data dictionary to define key metadata and organize
              the dataset. These data are populated directly by the policy
              coding team into Airtable and transferred <em>via</em> API into a
              database on Amazon Webservices. These data may be accessed
              directly from the backend database <em>via</em> API upon request.
              The data dictionary with complete description of all metadata
              fields can be downloaded as an Excel file{" "}
              <a
                href={
                  process.env.PUBLIC_URL +
                  "/export/COVID AMP data dictionary.xlsx"
                }
              >
                here
              </a>
              . The complete dataset can be downloaded from the Policy data page
              from covidamp.org/data.
            </p>
            <p>
              For the purpose of this effort, policies are defined as
              government-issued and backed by legal authority or precedent.
              Plans included in the dataset are documents issued by a
              government, non-profit, for-profit, or higher education
              institution that provide recommended actions or guidelines, but do
              not necessarily have legal basis or authority.
            </p>
            <p>
              The plans dataset is in development to be released in AMP at a
              later date (corresponding methods for plan data will be added at
              that time).
            </p>
            <p>
              Policies are coded and tagged with the relevant metadata manually.
              Each policy is tagged with a series of descriptive attributes
              based on a review of the policy language, including
              (representative subset &ndash; see data dictionary for full
              description of data fields):
            </p>
            <ul>
              <li>Policy name and description</li>
              <li>
                Policy type (e.g., executive order, emergency declaration,
                statute, etc.)
              </li>
              <li>
                Categorical description of the scope of policy actions (e.g.,
                social distancing, travel restrictions, enabling and relief
                measures, support for public health and clinical capacity) as
                well as more granular subcategory tagging (e.g., face coverings,
                quarantine, private sector closures, school closures, etc.)
              </li>
              <li>
                Authorizing role enacting the policy (e.g., governor, mayor,
                health official, president, city council, etc.)
              </li>
              <li>
                Start/end dates, including anticipated end dates for those
                policies still in effect but with declarative expirations
              </li>
              <li>
                Information about the geographic regions where the policy
                applies (if different from the level at which the policy was
                enacted)
              </li>
            </ul>
            <p>
              Researchers review public sources to identify policies, with the
              most common sources including government websites that collate
              policy announcements, either COVID-19-specific or more generally.
              If a documented policy is not available or where there are
              questions about the policy, researchers contact local public
              communications or other offices to confirm. A static copy (PDF or
              screen capture) of each policy is stored with links to any sites
              with associated policy announcements in the dataset.
            </p>
            <p>
              Legal experts review each policy following entry into the dataset
              to identify and code relevant authorities underlying the policy.
              In addition, for policies in the US, this data collection includes
              capturing attributes of the US state with respect to how legal
              authority is allocated between the local and state government (see
              definitions for Dillon&rsquo;s Rule and Home Rule states in the
              data dictionary available from the AMP documentation page).
            </p>
            <h2>Policy Map</h2>
            <p>
              The policy map visualizes the policies in effect over time.
              Currently, this is limited to the 50 US states and the District of
              Columbia and will expand at country scale, globally, as additional
              policies are collected for additional countries.
            </p>
            <h3>Visualizing policies in place, by category, over time</h3>
            <p>
              To visualize policies in effect of different types over time, the
              map queries the policy dataset by date and location. Policies can
              be viewed by category on the map:
            </p>
            <ul>
              <li>Social distancing</li>
              <li>Emergency declarations</li>
              <li>Travel restrictions</li>
              <li>Enabling and relief measures</li>
              <li>Support for public health capacity</li>
            </ul>
            <p>
              Policies can be viewed by multi-selected categories or
              sub-categories to view the status of each location based on
              polices in effect/not in effect related specifically to private
              sector closures, school closures, mass gatherings, and others.
            </p>
            <p>
              A date slider at the top of the map page provides the ability to
              select a date or date range over which to compare the policies in
              effect in a given category.
            </p>
            <h3>
              Visualizing distancing level, as analyzed from policies&nbsp;
            </h3>
            <p>
              Distancing level reflects major categories of status of the
              overall approach to COVID-19-related policies that address
              measures related to social distancing at a given time, including:
              Lockdown (Phase I), Stay-at-home (Phase II), Safer-at-home (Phase
              III), and New normal (Phase IV). Each phase is intended to reflect
              the approaches and phases that have emerged across the approach to
              COVID-19 response, including as aligned to the frameworks of the
              COVID Local Frontline Guide for Local Decision-Makers.
            </p>
            <p>
              The distancing status of each location is captured based on a
              day-by-day analysis of policies in effect for each state over
              time. In any case where an explicit policy is in effect, that
              status is used. In cases where a set of policies addressing school
              closures, private sector closures, and mass gatherings exist in
              specified combinations, the status is inferred from these policy
              categories, as follows. The definition for each distancing level
              is included and the bullets that follow reflect the conditions
              used to capture each status <em>via</em> and/or logic.&nbsp;
            </p>
            <div className={styles.phaseCriteria}>
              <p>
                <strong>Lockdown (Phase I):&nbsp;</strong>Policies do not allow
                residents to leave their place of residence unless explicitly
                permitted to do so.&nbsp;
              </p>
              <div>
                <ul>
                  <li>Lockdown order in place</li>
                </ul>
              </div>
              <p>
                <strong>Stay-at-home (Phase II):</strong>&nbsp;Policies limit
                most in-person activities and social events.
              </p>
              <ul>
                <li>Stay-at-home order OR</li>
                <li>School closures AND</li>
                <li>Private sector closures AND</li>
                <li>Mass gathering and/or event restrictions&nbsp;</li>
              </ul>
              <p>
                <strong>Safer-at-home (Phase III):</strong>&nbsp;Policies limit
                activities to those specifically permitted, encouraging extra
                precautions and retaining limits on mass gatherings.
              </p>
              <ul>
                <li>Safer at home&nbsp;order in place OR</li>
                <li>Private sector reopening OR</li>
                <li>Mass gathering limitations, may be somewhat relaxed</li>
                <li>School closure in place</li>
                <li>No stay-at-home order in place</li>
              </ul>
              <p>
                <strong>New normal (Phase IV):</strong>&nbsp;A majority of
                public restrictions on mass gatherings and non-essential
                businesses are lifted or expired, with some encouraging of
                safeguards such as face coverings.
              </p>
              <ul>
                <li>No safer-at-home order in place</li>
                <li>No stay-at-home order in place</li>
                <li>No private sector closures</li>
                <li>No mass gathering restrictions</li>
              </ul>
            </div>
            <h3>COVID caseload data&nbsp;</h3>
            <p>
              State-level COVID-19 caseload data, new cases in the last 7 days
              and cumulative cases, are sourced from the New York Times
              Coronavirus (Covid-19) Data in the United States (
              <a
                target="_blank"
                href="https://github.com/nytimes/covid-19-data"
              >
                https://github.com/nytimes/covid-19-data
              </a>
              ), as attributed on the interactive map. Data are updated daily.
              These data are collated by the New York Times on the basis of data
              from state and local health agencies. Data are used in accordance
              with the Creative Commons Attribution-Non Commercial 4.0
              International license.
            </p>
          </div>
        </div>
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
    <div className={styles.about}>
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
    </div>
  );
};

export default About;
