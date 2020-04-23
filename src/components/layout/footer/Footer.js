import React from "react";
import styles from "./footer.module.scss";
import talus from "../../../assets/images/logo-talus.png";
import Util from "../../misc/Util.js";

const Footer = () => {
  const images = [
    {
      imgSrc: talus,
      url: "http://talusanalytics.com/",
      alt: "Talus Analytics, LLC"
    }
  ];

  return (
    <div className={styles.footer}>
      <div className={styles.dataAsOf}></div>
      {images.map((d, i) => (
        <div>
          <a target="_blank" href={d.url} alt={d.alt}>
            <img src={d.imgSrc} />
          </a>
        </div>
      ))}
    </div>
  );
};

export default Footer;
