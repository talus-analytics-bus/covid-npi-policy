import React from "react";

import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";

import styles from "./Tooltip.module.scss";
import PolicyCategoryIcon from "../../../../PolicyCategoryIcon/PolicyCategoryIcon";

const formatDate = date => {
  if (!date) return undefined;
  return new Date(date).toLocaleString("en-de", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const TooltipContent = ({
  sliderDate,
  highlightPolicies,
  highlightCaseload,
}) => {
  const newPolicyCount =
    highlightPolicies && Object.values(highlightPolicies).flat().length;

  return (
    <div style={{ pointerEvents: "auto" }}>
      <header className={styles.greySection}>
        <div className={styles.date}>
          {formatDate(sliderDate.toISOString().substring(0, 10))}
        </div>
        <div className={styles.caseload}>
          <span className={styles.cases}>{highlightCaseload} cases</span>
          <span className={styles.caption}>7-day moving average</span>
        </div>
      </header>
      <section className={styles.content}>
        {newPolicyCount > 0 ? (
          <>
            {newPolicyCount} {newPolicyCount === 1 ? "Policy " : "Policies "}
          </>
        ) : (
          <>No policies </>
        )}
        went into effect on this date
      </section>
      {highlightPolicies && (
        <section className={styles.policies}>
          {Object.entries(highlightPolicies).map(([category, policies]) => (
            <a href="/policymaps" className={styles.policyLink}>
              <PolicyCategoryIcon
                category={category}
                style={{ width: "1.5em", height: "1.5em" }}
              />
              {category}: ({policies.length})
            </a>
          ))}
        </section>
      )}
    </div>
  );
};

const Tooltip = ({
  handleYPos,
  dim,
  sliderDate,
  highlightPolicies,
  highlightCaseload,
  popupVisible,
}) => {
  return (
    <foreignObject x={dim.xAxis.start.x} y={handleYPos} width={0} height={0}>
      <Tippy
        visible={popupVisible}
        content={
          <TooltipContent
            {...{ sliderDate, highlightPolicies, highlightCaseload }}
          />
        }
        placement={"right-start"}
        theme={"light"}
        popperOptions={{
          modifiers: [
            {
              name: "offset",
              options: {
                // the 10 accounts for the height of the little arrow
                offset: ({ reference }) => [-68, 17],
              },
            },
          ],
        }}
      >
        <div />
      </Tippy>
    </foreignObject>
  );
};

export default Tooltip;
