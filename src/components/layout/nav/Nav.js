import React from "react";
import classNames from "classnames";
import { Link } from "react-router-dom";
import styles from "./nav.module.scss";
import ReactTooltip from "react-tooltip";

// assets
import logo from "../../../assets/images/logo.svg";

const Nav = ({ page, ...props }) => {
  return (
    <div
      className={classNames(styles.navWrapper, {
        [styles.wide]: page === "map"
      })}
    >
      <div className={styles.nav}>
        <Link to={"/"}>
          <img src={logo} />
        </Link>
        <Link className={page === "data" ? styles.active : ""} to={"/"}>
          Data
        </Link>
        <Link className={page === "map" ? styles.active : ""} to={"/map"}>
          Policy maps
        </Link>

        <a target="_blank" href="https://gida.ghscosting.org/">
          gida.ghscosting.org
        </a>
      </div>
    </div>
  );
};

export default Nav;
