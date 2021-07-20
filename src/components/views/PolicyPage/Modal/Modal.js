import React from "react";
import { createPortal } from "react-dom";

import styles from "./Modal.module.scss";

const Modal = props => {
  return (
    <>
      {props.open &&
        createPortal(
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
          </div>,
          document.body
        )}
    </>
  );
};

export default Modal;
