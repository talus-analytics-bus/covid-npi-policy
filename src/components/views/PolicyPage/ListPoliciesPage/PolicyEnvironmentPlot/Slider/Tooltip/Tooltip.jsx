import React from "react";

import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";

import styles from "./Tooltip.module.scss";
import PolicyCategoryIcon from "../../../../PolicyCategoryIcon/PolicyCategoryIcon";

import { policyContext } from "../../../../PolicyRouter/PolicyRouter";
import PolicyModal from "./PolicyModal/PolicyModal";

const msPerDay = 86400000;

const formatDate = date => {
  if (!date) return undefined;
  return new Date(date.toDateString()).toLocaleString("en-de", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatNumber = number => {
  if (!number) return "";
  return number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
};

const TooltipContent = ({
  sliderDate,
  setCursorVisible,
  highlightPolicies,
  highlightCaseload,
  popupVisible,
}) => {
  const newPolicyCount =
    highlightPolicies &&
    highlightPolicies.enacted &&
    Object.values(highlightPolicies.enacted)
      .map(category => [...category])
      .flat().length;

  // const { setPolicyObject } = React.useContext(policyContext);

  // const handleLink = (e, category) => {
  //   setPolicyObject(prev => ({
  //     ...prev,
  //     [category]: { ...prev[category], open: true },
  //   }));
  // };

  return (
    <div
      style={{ pointerEvents: "auto" }}
      onMouseEnter={() => setCursorVisible(false)}
      onMouseLeave={() => setCursorVisible(true)}
    >
      <header className={styles.greySection}>
        <div className={styles.date}>
          {formatDate(new Date(sliderDate * msPerDay))}
        </div>
        <div className={styles.caseload}>
          <span className={styles.cases}>
            {formatNumber(highlightCaseload)} cases
          </span>
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
          {highlightPolicies &&
            highlightPolicies.enacted &&
            Object.entries(highlightPolicies.enacted).map(
              ([category, policies]) => (
                <PolicyModal
                  key={category}
                  {...{ category, policies, sliderDate, popupVisible }}
                >
                  <PolicyCategoryIcon
                    category={category}
                    style={{
                      width: "1.5rem",
                      height: "1.5rem",
                      marginRight: ".5rem",
                    }}
                  />
                  {category}: ({[...policies].length})
                </PolicyModal>
                // <a
                //   onClick={e => handleLink(e, category)}
                //   key={category}
                //   href={`#${category}`}
                //   className={styles.policyLink}
                // >
                //   <PolicyCategoryIcon
                //     category={category}
                //     style={{ width: "1.5em", height: "1.5em" }}
                //   />
                //   {category}: ({[...policies].length})
                // </a>
              )
            )}
        </section>
      )}
    </div>
  );
};

const Tooltip = ({
  handleYPos,
  sliderDate,
  setCursorVisible,
  highlightPolicies,
  highlightCaseload,
  popupVisible,
}) => {
  return (
    <foreignObject x={0} y={handleYPos} width={0} height={0}>
      <Tippy
        visible={popupVisible}
        content={
          <TooltipContent
            {...{
              sliderDate,
              setCursorVisible,
              highlightPolicies,
              highlightCaseload,
              popupVisible,
            }}
          />
        }
        placement={"right-start"}
        theme={"light"}
        maxWidth={"none"}
        popperOptions={{
          modifiers: [
            {
              name: "offset",
              options: {
                // the 10 accounts for the height of the little arrow
                offset: ({ reference }) => [-60, 17],
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

// memo equality check
const checkDate = (prev, next) => {
  return (
    prev.sliderDate === next.sliderDate &&
    prev.popupVisible === next.popupVisible
  );
};
const MemoizedTooltip = React.memo(Tooltip, checkDate);

export default MemoizedTooltip;
