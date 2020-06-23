import React, { useState, useEffect, useRef } from "react";
import classNames from "classnames";
import { Link } from "react-router-dom";
import styles from "./nav.module.scss";
import ReactTooltip from "react-tooltip";

// assets
import logo from "../../../assets/images/logo.svg";

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
    <div
      className={classNames(styles.navWrapper, {
        [styles.wide]: page === "policymaps",
        [styles.showMobileMenu]: showMobileMenu
      })}
    >
      <div className={styles.nav}>
        <a target="_blank" href={COVID_LOCAL_URL + "amp"}>
          <img src={logo} />
        </a>
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
            <Link
              onClick={() => {
                setShowMobileMenu(false);
              }}
              className={page === "about" ? styles.active : ""}
              to={"/about/amp"}
            >
              About
            </Link>
            <Link
              onClick={() => {
                setShowMobileMenu(false);
              }}
              className={page === "policymaps" ? styles.active : ""}
              to={"/policymaps"}
            >
              Policy maps
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
  );
};

export default Nav;
