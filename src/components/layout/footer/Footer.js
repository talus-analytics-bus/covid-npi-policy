import React from "react";
import styles from "./footer.module.scss";
import talus from "../../../assets/images/logo-talus.png";
import gu from "../../../assets/images/logo-georgetown.png";
import nti from "../../../assets/images/logo-nti.svg";
import Util from "../../misc/Util.js";
import classNames from "classnames";

// 3rd party packages
import moment from "moment";

const Footer = ({ page, versions }) => {
  // get last updated date
  const lastUpdatedPolicy = versions.find(d => d.type === "Policy data");
  const lastUpdatedCases = versions.find(d => d.type === "COVID-19 case data");
  const lastUpdatedDatePolicy =
    lastUpdatedPolicy !== undefined ? lastUpdatedPolicy.date : null;
  const lastUpdatedDateCases =
    lastUpdatedCases !== undefined ? lastUpdatedCases.date : null;

  // define footer images and links
  const images = [
    {
      imgSrc: gu,
      url: "https://ghss.georgetown.edu/",
      alt:
        "Georgetown University Center for Global Health Science and Security",
      txt: null,
    },
    {
      imgSrc: talus,
      url: "http://talusanalytics.com/",
      alt: "Talus Analytics, LLC",
      // txt: "Built by",
      // style: {
      //   height: "60px",
      //   position: "relative"
      // }
    },
    {
      imgSrc: nti,
      url: "https://www.nti.org/about/biosecurity/",
      alt: "Nuclear Threat Initiative",
      txt: null,
    },
  ];

  return (
    <div
      className={classNames(styles.footer, {
        [styles.wide]: page === "policymaps" || page === "model",
      })}
    >
      <div className={styles.wrapper}>
        <div className={styles.content}>
          <div className={styles.dataAsOf}>
            {
              // TODO set date dynamically from API
            }
            {lastUpdatedDatePolicy && (
              <span>
                Policy and plan data last updated{" "}
                {new moment(lastUpdatedDatePolicy).format("MMM D, YYYY")}
              </span>
            )}
            .{" "}
            {lastUpdatedDatePolicy && (
              <span>
                COVID-19 case data last updated{" "}
                {new moment(lastUpdatedDateCases).format("MMM D, YYYY")}
                {lastUpdatedCases.last_datum_date !== null && (
                  <span>
                    {" "}
                    with data available through{" "}
                    {moment(lastUpdatedCases.last_datum_date).format(
                      "MMM D, YYYY"
                    )}
                  </span>
                )}
              </span>
            )}
            .
          </div>
          <div className={styles.links}>
            {images.map(d => (
              <a key={d.imgSrc} target="_blank" href={d.url} alt={d.alt}>
                <img style={d.style} src={d.imgSrc} />
                {d.txt && <div>{d.txt}</div>}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
