import React from "react";
import styles from "./footer.module.scss";
import talus from "../../../assets/images/logo-talus.png";
import gu from "../../../assets/images/logo-georgetown.png";
import nti from "../../../assets/images/logo-nti.svg";
import Util from "../../misc/Util.js";

const Footer = () => {
  const images = [
    {
      imgSrc: nti,
      url: "https://www.nti.org/about/biosecurity/",
      alt: "Nuclear Threat Initiative",
      txt: null
    },
    {
      imgSrc: gu,
      url: "https://ghss.georgetown.edu/",
      alt:
        "Georgetown University Center for Global Health Science and Security",
      txt: null
    },
    {
      imgSrc: talus,
      url: "http://talusanalytics.com/",
      alt: "Talus Analytics, LLC"
      // txt: "Built by",
      // style: {
      //   height: "60px",
      //   position: "relative"
      // }
    }
  ];

  return (
    <div className={styles.footer}>
      <div className={styles.content}>
        {images.map(d => (
          <a target="_blank" href={d.url} alt={d.alt}>
            <img style={d.style} src={d.imgSrc} />
            {d.txt && <div>{d.txt}</div>}
          </a>
        ))}
      </div>
    </div>
  );
};

export default Footer;
