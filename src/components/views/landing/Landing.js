import React from "react";
import { Helmet } from "react-helmet";
import styles from "./Landing.module.scss";
import { Link } from "react-router-dom";

import ampLogo from "../../../assets/images/amp.png";
import policyMapsImage from "../../../assets/images/amp-screenshots/policy-maps.png";
import policyModelImage from "../../../assets/images/amp-screenshots/policy-model-4.png";
import locationPageImage from "../../../assets/images/amp-screenshots/location-page-4.png";
import policyDatabaseImage from "../../../assets/images/amp-screenshots/data-page-2.png";
import ideaLogo from "../../../assets/images/logo-title.png";
import guLogo from "../../../assets/images/logo-georgetown.png";
import talusLogo from "../../../assets/images/logo-talus.png";
import ntiLogo from "../../../assets/images/logo-nti.png";

const Landing = ({ setPage, setLoading }, props) => {
  React.useEffect(() => {
    setPage("landing");
    setLoading(false);
  }, [setPage, setLoading]);

  return (
    <div className={styles.ampLanding}>
      <Helmet titleTemplate={"%s"}>
        <title>COVID AMP</title>
        <meta name="COVID AMP" />
      </Helmet>
      <div className={styles.curtainRod}>
        <div className={styles.drapes}>
          <a href="https://covid-local.org">
            <div className={styles.backButton}></div>
            <div className={styles.navbarLogo}></div>
            <h1>
              <strong>COVID</strong> LOCAL
            </h1>
          </a>
        </div>
        <div className={styles.contactDrape}>
          <Link to="/contact/" className={styles.drapes}>
            Contact Us
          </Link>
        </div>
      </div>

      <div className={styles.ampLandingContent}>
        <div className={styles.ampHeader}>
          <div className={styles.wrapHolder}>
            <img src={ampLogo} alt="COVID AMP Logo" />
          </div>
          <div className={styles.links}>
            <Link to="/about/doc">Documentation</Link>
            <Link to="/about/amp">About</Link>
          </div>
        </div>
        <div className={styles.ampDescription}>
          <h3>Visualizing the impact of policies on COVID response</h3>
          <p>
            The COVID Analysis and Mapping of Policies (AMP) visualization tool
            is a comprehensive database of policies and plans to address the
            COVID-19 pandemic. Decision-makers can use COVID AMP’s user-friendly
            interface to easily identify effective policies and plans to reduce
            the impacts of the COVID-19 pandemic.
          </p>
        </div>
        <div className={styles.ampColumns}>
          <div className={styles.col}>
            <Link to="/policymaps">
              <img
                className={styles.mapImage}
                src={policyMapsImage}
                alt="Policy Maps"
              />
              <span>Policy maps</span>
            </Link>
          </div>
          <div className={styles.col}>
            <Link to="/data">
              <img src={locationPageImage} alt="Policy Database" />
              <span>View Location</span>
            </Link>
          </div>
          <div className={styles.col}>
            <Link to="/model">
              <img src={policyModelImage} alt="Policy Model" />
              <span>Policy model</span>
            </Link>
          </div>
          <div className={styles.col}>
            <Link to="/data">
              <img src={policyDatabaseImage} alt="Policy Database" />
              <span>Access data</span>
            </Link>
          </div>
        </div>
      </div>
      <div class={styles.footer}>
        <div class={styles.content}>
          <a target="_blank" href="https://ghssidea.org">
            <img
              src={ideaLogo}
              alt="International Disease and Events Analysis"
            />
          </a>
          <a target="_blank" href="https://ghss.georgetown.edu/">
            <img
              src={guLogo}
              alt="Georgetown University Center for Global Health Science and Security"
            />
          </a>
          <a
            target="_blank"
            href="http://talusanalytics.com/"
            className={styles.talusLogo}
          >
            <img src={talusLogo} alt="Talus Analytics, LLC" />
            <div className={styles.builtBy}>Built by</div>
          </a>
          <a target="_blank" href="https://www.nti.org/">
            <img src={ntiLogo} alt="Nuclear Threat Initiative" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Landing;
