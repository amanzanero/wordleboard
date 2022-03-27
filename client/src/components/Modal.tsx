import React from "react";
import { classnames } from "utils/classnames";

export type ModalProps = { open: boolean; closeModal: () => void; title: string; full?: boolean };
const Modal: React.FC<ModalProps> = ({ open, closeModal, title, children, full }) => {
  return (
    <div
      onClick={closeModal}
      className={classnames(
        "modal items-center transition-all py-4",
        open ? "modal-open" : undefined,
      )}>
      <div
        className={classnames(
          "modal-box flex flex-col",
          full === true ? "h-full sm:h-auto sm:min-h-[32rem]" : undefined,
        )}
        onClick={(e) => e.stopPropagation()}>
        <h3 className="font-bold text-lg">{title}</h3>
        <div className="pt-4 flex-grow flex flex-col">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
