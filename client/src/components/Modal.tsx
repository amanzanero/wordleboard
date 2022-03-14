import React from "react";
import { classnames } from "utils/classnames";

const Modal: React.FC<{ open: boolean; closeModal: () => void }> = ({ open, closeModal }) => {
  return (
    <div
      onClick={closeModal}
      className={classnames("modal cursor-pointer", open ? "modal-open" : "")}>
      <div className="modal-box">
        <h3 className="font-bold text-lg">Congratulations random Interner user!</h3>
        <p className="py-4">
          You&apos;ve been selected for a chance to get one year of subscription to use Wikipedia
          for free!
        </p>
        <div className="modal-action">
          <label htmlFor="my-modal" className="btn">
            Yay!
          </label>
        </div>
      </div>
    </div>
  );
};

export default Modal;
