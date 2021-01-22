import React from "react";

import Modal from "./Modal/Modal";
import SourceSummary from "./SourceSummary/SourceSummary";

import styles from "./ExploreSource.module.scss";

const ExploreSource = ({ policy }) => {
  const [modalOpen, setModalOpen] = React.useState(false);

  return (
    <>
      <button className={styles.button} onClick={() => setModalOpen(true)}>
        EXPLORE SOURCE
      </button>
      <Modal open={modalOpen} setOpen={setModalOpen}>
        <SourceSummary {...{ policy, setModalOpen }} />
      </Modal>
    </>
  );
};

export default ExploreSource;
