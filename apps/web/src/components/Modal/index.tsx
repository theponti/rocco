import styled from "@emotion/styled";
import { KeyboardEvent, RefObject, forwardRef, useCallback } from "react";

const StyledDialog = styled.dialog`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  overflow: hidden;
  transition: background-color 0.2s ease-in-out;

  @media screen and (max-width: 400px) {
    margin: 0;
  }
`;

type ModalProps = {
  children: React.ReactNode;
  isOpen: boolean;
  onModalClose: () => void;
};
function Modal(
  { children, isOpen, onModalClose }: ModalProps,
  ref: RefObject<HTMLDialogElement | null>
) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDialogElement>) => {
      if (event.code === "Escape") {
        onModalClose();
      }
    },
    [onModalClose]
  );

  return (
    <StyledDialog
      id="roccoModal"
      className={`modal ${isOpen ? "modal-open" : ""}`}
      ref={ref}
      onKeyDown={handleKeyDown}
    >
      <form method="dialog" className="modal-box">
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={onModalClose}
        >
          ✕
        </button>
        {children}
      </form>
    </StyledDialog>
  );
}

export default forwardRef(Modal);
