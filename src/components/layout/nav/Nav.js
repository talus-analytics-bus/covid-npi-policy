import React from "react";
import classNames from "classnames";
import { Link } from "react-router-dom";
import styles from "./nav.module.scss";
import ReactTooltip from "react-tooltip";

// assets
import logo from "../../../assets/images/logo.svg";

const Nav = ({ wide, ...props }) => {
  return (
    <div className={classNames(styles.nav, { [styles.wide]: wide })}>
      <div>
        <Link to={"/"}>
          <img src={logo} />
        </Link>
        <a target="_blank" href="https://gida.ghscosting.org/">
          Return to gida.ghscosting.org
        </a>
      </div>
    </div>
  );
};

export default Nav;
