import React from "react";
import classNames from "classnames";
import { Link } from "react-router-dom";
import styles from "./nav.module.scss";
import ReactTooltip from "react-tooltip";

// assets
import logo from "../../../assets/images/logo.png";

const Nav = ({ ...props }) => {
  return (
    <div className={styles.nav}>
      <div>
        <Link to={"/"}>
          <img src={logo} />
        </Link>
      </div>
    </div>
  );
};

export default Nav;
