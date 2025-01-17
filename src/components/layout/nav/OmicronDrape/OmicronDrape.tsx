import { XCloseBtn } from "components/common";
import NotificationDrape from "components/common/NotificationDrape/NotificationDrape";
import { FC, useCallback, useState } from "react";
import { Link } from "react-router-dom";
import styled, { css } from "styled-components";
// TODO implement module declaration that handles color exports correctly
import * as colorsTmp from "../../../../assets/styles/vars.module.scss";
const colors = colorsTmp as any;

const DrapeContent = styled.div`
  display: flex;
  flex-flow: row;
  align-items: center;
  font-size: 1em;
  &,
  a {
    color: white !important;
  }
  /* color: #aba8a8; */
  font-family: "Open Sans", sans-serif;

  em {
    font-style: normal;
    font-weight: bold;
  }
  > *:not(:first-child) {
    margin-left: 1em;
  }
  a {
    text-decoration: underline;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5em;
  padding: 0;
  margin: 0;
  line-height: 0;
`;

const customCSS = css`
  position: absolute !important;
  top: 0;
  /* height: 32px; */
  background-color: ${colors.orange};
  padding: 12px 18px;
  margin-left: 0 !important;
  pointer-events: all !important;
  @media (max-width: 615px) {
    flex-flow: column;
    > div {
      flex-flow: column;
      align-items: flex-start;
      * {
        margin: 0 !important;
      }
      > button {
        position: absolute;
        top: 15px;
        right: 10px;
      }
    }
  }
  @media (max-width: 1100px) {
    /* top: 70px; */
    z-index: 10001;
    left: 0;
    width: 100%;
    > div {
      width: 100%;
      right: unset !important;
      > button {
        margin-left: auto !important;
        /* position: static; */
      }
    }
  }
`;

// const dataUrl: string = getDataUrl();

interface OmicronDrapeProps {
  narrow?: boolean;
}

export const OmicronDrape: FC<OmicronDrapeProps> = ({ narrow = false }) => {
  // already dismissed?
  let defaultShow: boolean = true;
  if (typeof localStorage !== "undefined") {
    if (localStorage.getItem("omicronDrape") === "dismissed")
      defaultShow = false;
  }

  const [show, setShow] = useState(defaultShow);

  const onClose = useCallback(() => {
    setShow(false);
    // localStorage.setItem("omicronDrape", "dismissed");
  }, [setShow]);
  return (
    <NotificationDrape {...{ customCSS, show, narrow }}>
      <DrapeContent>
        <em>NEW</em>
        <span>View current Omicron travel restrictions</span>
        <Link
          to={{
            pathname: "/policymaps",
            key: Math.random().toString(),
            state: {
              routedFrom: "OmicronDrape-" + Math.random().toString(),
            },
            search: "?mapId=global&view=omicron_travel",
          }}
        >
          On map
        </Link>
        <Link
          to={{
            pathname: "/data",
            key: Math.random().toString(),
            state: {
              routedFrom: "OmicronDrape-" + Math.random().toString(),
            },
            search: getSearch(),
          }}
        >
          In table
        </Link>
        <CloseButton onClick={onClose}>
          <XCloseBtn white style={{ margin: 0 }} />
        </CloseButton>
      </DrapeContent>
    </NotificationDrape>
  );
};

export default OmicronDrape;

/**
 * Returns a URL that will route to the Data page showing Omicron travel
 * restrictions that are in effect today.
 * @returns {string} URL
 */
export function getOmicronFilters(): Record<string, any> {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${today.getMonth() +
    1}-${today.getDate()}`;
  const filtersPolicy: Record<string, any> = {
    subtarget: ["Omicron"],
    dates_in_effect: [todayStr, todayStr],
    primary_ph_measure: ["Travel restrictions"],
  };
  return filtersPolicy;
}

export const omicronFilters = getOmicronFilters();

export const omicronFiltersSubs = {
  ...omicronFilters,
  ph_measure_details: [
    "Domestic travel restriction",
    "Domestic travel restrictions (interstate)",
    "Domestic travel restrictions (intrastate)",
    "International travel restriction",
  ],
};

/**
 * Returns a URL that will route to the Data page showing Omicron travel
 * restrictions that are in effect today.
 * @returns {string} URL
 */
function getSearch(): string {
  const params = new URLSearchParams();
  params.append("type", "policy");
  params.append("placeType", "affected");
  params.append("filters_policy", JSON.stringify(getOmicronFilters()));

  return `?${params.toString()}`;
}
