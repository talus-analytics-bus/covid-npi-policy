import React, { useState, useEffect, useRef } from "react";
import classNames from "classnames";
import { Link, NavLink } from "react-router-dom";
import styles from "./nav.module.scss";
import ReactTooltip from "react-tooltip";

// assets
import logo from "../../../assets/images/logo.svg";
import localBanner from "../../../assets/images/local-banner.svg";

import HoverDropdown from "./HoverDropdown/HoverDropdown";
import LocationSearch from "./LocationSearch/LocationSearch";

// constants
const COVID_LOCAL_URL = process.env.REACT_APP_COVID_LOCAL_URL;

const Nav = ({ page, ...props }) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const linksRef = useRef(null);
  const hamburgerRef = useRef(null);

  // EFFECT HOOKS // --------------------------------------------------------//
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
                {/* <Link */}
                {/*   onClick={() => { */}
                {/*     setShowMobileMenu(false); */}
                {/*   }} */}
                {/*   className={page === "policymaps" ? styles.active : ""} */}
                {/*   to={"/policymaps"} */}
                {/* > */}
                {/*   Map */}
                {/* </Link> */}
                <HoverDropdown>
                  <span className={styles.hoverTarget}>Location</span>
                  <div className={styles.navSubmenu}>
                    <Link
                      onClick={() => {
                        setShowMobileMenu(false);
                      }}
                      className={page === "policymaps" ? styles.active : ""}
                      to={"/policymaps"}
                    >
                      Map
                    </Link>
                    <p>search goes here</p>
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
