import React, { useState, useEffect, useRef, useContext } from "react";
import classNames from "classnames";
import { Link } from "react-router-dom";
import styles from "./nav.module.scss";

// assets
import logo from "../../../assets/images/full-amp-logo.png";
import localBanner from "../../../assets/images/local-banner.svg";

import HoverDropdown from "./HoverDropdown/HoverDropdown";
import LocationSearch from "./LocationSearch/LocationSearch";
import { getParamsMapId } from "components/views/map/helpers";

import InfoTooltipContext from "context/InfoTooltipContext";
import { InfoTooltip } from "components/common";
import NotificationDrape from "components/common/NotificationDrape/NotificationDrape";
import OmicronDrape from "./OmicronDrape/OmicronDrape";

// constants
const COVID_LOCAL_URL = process.env.REACT_APP_COVID_LOCAL_URL;

const Nav = ({ page }) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const linksRef = useRef(null);
  const hamburgerRef = useRef(null);

  // CONSTANTS // ---------------------------------------------------------- //
  const curMapId = getParamsMapId() || "";

  // CONTEXTS // ----------------------------------------------------------- //
  const { setInfoTooltipContent } = useContext(InfoTooltipContext);

  // EFFECT HOOKS // ------------------------------------------------------- //
  // on click anywhere but in menu, and menu is shown, close menu; otherwise
  // do nothing
  useEffect(() => {
    document.getElementById("root").onclick = e => {
      if (linksRef === null || linksRef.current === null) return;
      const links = linksRef.current;
      if (links.contains(e.target) || hamburgerRef.current.contains(e.target))
        return;
      else {
        setShowMobileMenu(false);
      }
    };
  }, [showMobileMenu]);

  const dropdownMenuClasses = classNames(
    styles.hoverTarget,
    styles.withSubmenu
  );
  return (
    <>
      {page !== "landing" && (
        <div
          data-page={page}
          className={classNames(styles.navWrapper, {
            [styles.wide]: page === "policymaps",
            [styles.showMobileMenu]: showMobileMenu,
          })}
        >
          <div className={styles.nav}>
            <div className={styles.logos}>
              <a
                target="_blank"
                href={COVID_LOCAL_URL}
                className={styles.localBanner}
                rel="noreferrer"
              >
                <img src={localBanner} alt="COVID Local" />
              </a>
              <Link to="/" className={styles.logo}>
                <img src={logo} alt="Landing Page" />
              </Link>
            </div>
            <div className={styles.menu}>
              <button ref={hamburgerRef} className={styles.hamburger}>
                <i
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowMobileMenu(!showMobileMenu);
                  }}
                  className={classNames("material-icons")}
                >
                  {showMobileMenu ? "close" : "menu"}
                </i>
              </button>
              <div ref={linksRef} className={styles.links}>
                <HoverDropdown>
                  <span
                    className={classNames(
                      dropdownMenuClasses,
                      page === "policymaps" ? styles.active : ""
                    )}
                  >
                    Map
                  </span>
                  <div className={styles.navSubmenu}>
                    <Link
                      onClick={() => {
                        setShowMobileMenu(false);
                      }}
                      className={
                        page === "policymaps" && curMapId === "global"
                          ? styles.active
                          : ""
                      }
                      to={"/policymaps?mapId=global"}
                    >
                      <div className={styles.linkWithTooltip}>
                        <div>World</div>
                        <InfoTooltip
                          text={"View data for the world at the country level"}
                          {...{ setInfoTooltipContent }}
                        />
                      </div>
                    </Link>
                    <Link
                      onClick={() => {
                        setShowMobileMenu(false);
                      }}
                      className={
                        page === "policymaps" && curMapId.startsWith("us")
                          ? styles.active
                          : ""
                      }
                      to={"/policymaps?mapId=us-county-plus-state"}
                    >
                      <div className={styles.linkWithTooltip}>
                        <span>United States</span>
                        <InfoTooltip
                          text={
                            "View data for the United States at the state and/or county level"
                          }
                          {...{ setInfoTooltipContent }}
                        />
                      </div>
                    </Link>
                  </div>
                </HoverDropdown>
                <HoverDropdown>
                  <span className={dropdownMenuClasses}>Location</span>
                  <div className={styles.navSubmenu}>
                    <LocationSearch />
                  </div>
                </HoverDropdown>
                <Link
                  onClick={() => {
                    setShowMobileMenu(false);
                  }}
                  className={page === "model" ? styles.active : ""}
                  to={"/model"}
                >
                  Model
                </Link>
                <Link
                  onClick={() => {
                    setShowMobileMenu(false);
                  }}
                  className={page === "data" ? styles.active : ""}
                  to={{
                    pathname: "/data",
                    key: Math.random().toString(),
                    state: {
                      routedFrom:
                        (page === "data" ? "NavOnData-" : "NavElsewhere-") +
                        Math.random().toString(),
                    },
                    search: "?type=policy",
                  }}
                >
                  Data
                </Link>
                <HoverDropdown>
                  <span
                    className={classNames(
                      dropdownMenuClasses,
                      page !== null && page.startsWith("about")
                        ? styles.active
                        : ""
                    )}
                  >
                    About
                  </span>
                  <div className={styles.navSubmenu}>
                    <Link
                      onClick={() => {
                        setShowMobileMenu(false);
                      }}
                      className={page === "about-doc" ? styles.active : ""}
                      to={"/about/doc"}
                    >
                      Documentation
                    </Link>
                    <Link
                      onClick={() => {
                        setShowMobileMenu(false);
                      }}
                      className={page === "about-amp" ? styles.active : ""}
                      to={"/about/amp"}
                    >
                      What is COVID AMP?
                    </Link>
                  </div>
                </HoverDropdown>
                <Link
                  onClick={() => {
                    setShowMobileMenu(false);
                  }}
                  className={page === "contact" ? styles.active : ""}
                  to={"/contact"}
                >
                  Contact us
                </Link>
                {
                  // <Link
                  //   onClick={() => {
                  //     setShowMobileMenu(false);
                  //   }}
                  //   className={page === "documentation" ? styles.active : ""}
                  //   to={"/data/documentation"}
                  // >
                  //   Documentation
                  // </Link>
                }

                {
                  // <a target="_blank" href="https://gida.ghscosting.org/">
                  //   gida.ghscosting.org
                  // </a>
                }
              </div>
              <OmicronDrape />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Nav;
