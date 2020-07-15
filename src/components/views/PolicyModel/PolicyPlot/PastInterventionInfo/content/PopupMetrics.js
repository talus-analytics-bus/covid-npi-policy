// 3rd party libraries
import React from "react";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";

// styles and assets
import styles from "./PopupMetrics.module.scss";
import classNames from "classnames";
import infoIcon from "../../../../../../assets/icons/info-blue.svg";

const formatDate = date =>
  new Date(date).toLocaleString("default", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

// Standardized format for popup metrics on Victory chart
export const PopupMetrics = ({ ...props }) => {
  console.log("props");
  console.log(props);
  const metricList = [
    {
      label: "Policies in effect",
      value: <div>Dot with value label and link "view policies"</div>,
    },
    {
      label: (
        <span>
          y-axis metric{" "}
          <Tippy
            interactive={true}
            allowHTML={true}
            content={<p>y-axis metric definition</p>}
            maxWidth={"30rem"}
            theme={"light"}
            placement={"bottom"}
            offset={[-30, 10]} // CHECK
          >
            <img
              className={styles.infoIcon}
              src={infoIcon}
              alt="More information"
            />
          </Tippy>
        </span>
      ),
      value: (
        <div>
          <div>
            <div>Big number</div>
            <div>Unit label</div>
          </div>
          <div>
            <div>Trend box</div>
            <div>Trend label</div>
          </div>
        </div>
      ),
    },
    {
      label: "Counterfactual y-axis metric",
      value: (
        <div>
          <div>
            <div>Big number</div>
            <div>Unit label</div>
          </div>
        </div>
      ),
    },
    {
      label: "Reduction in contacts metric",
      value: (
        <div>
          <div>
            <div>Big number</div>
            <div>Unit label</div>
          </div>
        </div>
      ),
    },
  ];
  return (
    <table className={styles.popupMetrics}>
      {metricList.map(({ label, value }) => (
        <Metric {...{ label, value }} />
      ))}
    </table>
  );
};

// metrics corresponding to rows in the popup
const Metric = ({ label, value }) => {
  return (
    <tr>
      <div className={styles.metric}>
        <td className={styles.label}>{label}</td>
        <td className={styles.value}>{value}</td>
      </div>
    </tr>
  );
};
export default PopupMetrics;
