import React from "react";

import Modal from "../../../../../Modal/Modal";

import styles from "./PolicyModal.module.scss";

const formatDate = date => {
  if (!date) return undefined;
  return new Date(date).toLocaleString("en-de", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const PolicyModal = ({ children, category, policies, sliderDate }) => {
  const [modalOpen, setModalOpen] = React.useState(false);

  const buttonClick = e => {
    e.preventDefault();
    e.stopPropagation();
    setModalOpen(true);
  };

  return (
    <>
      <button className={styles.button} onClick={buttonClick}>
        {children}
      </button>
      <Modal open={modalOpen} setOpen={setModalOpen}>
        <h3>
          {category} policies enacted on{" "}
          {formatDate(sliderDate.toISOString().substring(0, 10))}
        </h3>
        {/* <SourceSummary {...{ policy, setModalOpen }} /> */}
      </Modal>
    </>
  );
};

export default PolicyModal;
