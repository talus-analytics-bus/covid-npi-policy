import React from "react";

import styles from "./Modal.module.scss";

const Modal = props => (
  <>
    {props.open && (
      <div className={styles.modalContainer}>
        <button
          aria-label="Close Modal"
          className={styles.modalBackground}
          onClick={() => props.setOpen(false)}
        />
        <div className={styles.modal}>
          <button
            aria-label="Close Modal"
            className={styles.closeModalButton}
            onClick={() => props.setOpen(false)}
          />
          {props.children}
        </div>
      </div>
    )}
  </>
);

export default Modal;
