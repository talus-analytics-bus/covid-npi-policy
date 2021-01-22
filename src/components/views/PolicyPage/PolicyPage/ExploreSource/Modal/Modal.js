import React from "react";

import styles from "./Modal.module.scss";

const Modal = props => (
  <>
    {props.open && (
      <div className={styles.modalContainer}>
        <button
          className={styles.modalBackground}
          onClick={() => props.setOpen(false)}
        />
        <div className={styles.modal}>{props.children}</div>
      </div>
    )}
  </>
);

export default Modal;
