import { Transition } from "@headlessui/react";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
export const Modal = (props: {
  children: React.ReactNode;
  onClose: () => void;
  title?: string;
  visible: boolean;
  hideBG?: boolean;
  className?: string;
}) => {
  const { children, onClose, visible, hideBG, className } = props;
  const [document, setDocument] = useState(null as Document | null);
  useEffect(() => {
    setDocument(window.document);
  }, []);
  if (!document) return null;

  return createPortal(
    <>
      <div
        className={`z-50 fixed top-0 left-0 w-screen h-screen bg-gray-900 ${
          visible
            ? `opacity-40 dark:opacity-80`
            : `opacity-0 pointer-events-none`
        }`}
        onClick={onClose}
      />
      <Transition
        show={visible}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 scale-0"
        enterTo="opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-0"
        as={React.Fragment}
      >
        <div
          className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 ${
            !hideBG && `dark:bg-gray-800 bg-gray-150`
          } p-2 rounded-2xl dark:text-gray-100 ${className}`}
        >
          {children}
        </div>
      </Transition>
    </>,
    document.getElementById("base")!
  );
};
