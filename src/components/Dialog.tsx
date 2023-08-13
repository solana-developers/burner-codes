import { Dispatch, Fragment, SetStateAction } from "react";

import { Dialog as HeadlessDialog, Transition } from "@headlessui/react";
import styles from "@/styles/Dialog.module.css";

export type DialogProps = SimpleComponentProps & {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  title?: string;
  description?: string | JSX.Element;
};

export default function Dialog({
  isOpen,
  setIsOpen,
  children,
  className = "max-w-md",
}: DialogProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <HeadlessDialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className={styles.dialog}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          {/* The backdrop, rendered as a fixed sibling to the panel container */}
          <div className={styles.overlay} aria-hidden="true" />
        </Transition.Child>

        <div className={styles.container}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <HeadlessDialog.Panel className={`${styles.panel}  ${className}`}>
              {children}
            </HeadlessDialog.Panel>
          </Transition.Child>
        </div>
      </HeadlessDialog>
    </Transition>
  );
}
