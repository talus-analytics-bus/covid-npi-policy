import React, { FunctionComponent, ReactElement } from "react";
import styles from "./FormatAndDisplay.module.scss";
type Formattable = {
  children: any;
};

// Formatting components to display numbers in a standardized way.
// These components should not add any nodes besides TextNodes to the dom
// so that they do not interfere with CSS styling in components where
// they are used.

// Add thousands place commas to number
export const ExactNumber: FunctionComponent<Formattable> = (
  props
): ReactElement | null => {
  if (props.children === null || props.children === undefined) return null;
  else {
    const formatted = props.children
      .toString()
      .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
    return <>{formatted}</>;
  }
};

// rounds to the nearest int for numbers less than 10,
// nearest 10 for numbers less than 100, and
// nearest hundred for numbers larger than that.
export const ModeledNumber: FunctionComponent<Formattable> = props => {
  if (props.children === null || props.children === undefined) return null;

  let integer;
  if (typeof props.children === "string")
    integer = parseInt(props.children as string);
  else {
    integer = Math.round(props.children as number);
  }

  let formatted;
  if (integer <= 10) {
    formatted = integer.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
  } else if (integer <= 100) {
    formatted = (Math.round(integer / 10) * 10)
      .toString()
      .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
  } else {
    formatted = (Math.round(integer / 100) * 100)
      .toString()
      .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
  }

  return <>{formatted}</>;
};

// format date as May 29, 2020
export const LocalDate: FunctionComponent<Formattable> = props => {
  if (props.children === null || props.children === undefined) return null;
  const formatted = new Date(props.children).toLocaleString("default", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  return <>{formatted}</>;
};

export const Month: FunctionComponent<Formattable> = props => {
  if (props.children === null || props.children === undefined) return null;
  const formatted = new Date(props.children).toLocaleString("default", {
    month: "short",
    timeZone: "UTC",
  });

  return <>{formatted}</>;
};

// convert decimal to percent
export const Percent: FunctionComponent<Formattable> = props => {
  if (props.children === null || props.children === undefined) return null;
  const formatted = Math.round((props.children as number) * 100) + "%";
  return <>{formatted}</>;
};

export const Sources: FunctionComponent<{ data: any; lag: any }> = props => {
  if (props.data) {
    const sources: any[] = props.data
      .flat()
      .map((point: { source: any }) => point.source);
    const sourcesL1: any[] = props.lag
      ? props.data.flat().map((point: { sourceL1: any }) => point.sourceL1)
      : [];
    const sourceSet: Set<any> = new Set([...sources, ...sourcesL1]);
    const allSources: any[] = Array.from(sourceSet);
    return (
      <>
        {allSources.map((source, index) => {
          let sep =
            index + 2 > allSources.length
              ? " "
              : index + 2 < allSources.length
              ? ", "
              : " and ";
          return <span key={index}>{source + sep}</span>;
        })}
      </>
    );
  } else {
    return null;
  }
};

/**
 * Format in gray italics, a subtle note.
 */
export const Subtle: FunctionComponent<Formattable> = props => {
  if (props.children === null || props.children === undefined) return null;
  return <span className={styles.subtleNote}>{props.children}</span>;
};
