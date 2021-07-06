import React, { useState, useEffect, useRef, useContext } from "react";
import classNames from "classnames";
import { Link, NavLink } from "react-router-dom";
import styles from "./nav.module.scss";

// assets
import logo from "../../../assets/images/full-amp-logo.png";
import localBanner from "../../../assets/images/local-banner.svg";

import HoverDropdown from "./HoverDropdown/HoverDropdown";
import LocationSearch from "./LocationSearch/LocationSearch";
import { getParamsMapId } from "components/views/map/helpers";

import InfoTooltipContext from "context/InfoTooltipContext";
import { InfoTooltip } from "components/common";

// constants
const COVID_LOCAL_URL = process.env.REACT_APP_COVID_LOCAL_URL;

const Nav = ({ page, ...props }) => {
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
            [styles.wide]: page === "policymaps" || page === "model",
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
                  to={"/data"}
                >
                  Data
                </Link>
                <NavLink
                  onClick={() => {
                    setShowMobileMenu(false);
                  }}
                  activeClassName={styles.active}
                  to={"/about/doc"}
                >
                  Documentation
                </NavLink>
                <NavLink
                  onClick={() => {
                    setShowMobileMenu(false);
                  }}
                  activeClassName={styles.active}
                  to={"/about/amp"}
                >
                  About
                </NavLink>
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
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Nav;
