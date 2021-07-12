import React, { FC } from "react";
import styles from "./PageHeader.module.scss";

interface PageHeaderProps {
  /**
   * The header content that will be enclosed in a `h1` tag.
   */
  children: any;
}

/**
 * Page header appearing at the top of most COVID AMP pages.
 * @param props Component properties
 * @returns The page header
 */
export const PageHeader: FC<PageHeaderProps> = ({ children }) => {
  return <h1 className={styles.pageHeader}>{children}</h1>;
};

export default PageHeader;
