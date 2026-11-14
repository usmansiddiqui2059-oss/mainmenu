import { type ReactNode, useEffect, useId, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
export function Modal({
  title,
  viewKey,
  onClose,
  children,
}: {
  title: string;
  viewKey: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null),
    id = useId(),
    reduced = useReducedMotion();
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null,
      root = ref.current!;
    const focusables = () => [
      ...root.querySelectorAll<HTMLElement>(
        'button:not(:disabled),input,a[href],select,[tabindex="0"]',
      ),
    ];
    const timer = window.setTimeout(() => focusables()[0]?.focus(), 0);
    const keydown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
      if (e.key === "Tab") {
        const nodes = focusables(),
          first = nodes[0],
          last = nodes.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", keydown);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", keydown);
      previous?.focus();
    };
  }, [onClose]);
  return (
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0 : 0.22 }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        layout
        className="modal"
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={id}
        initial={{ opacity: 0, x: reduced ? 0 : 18 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: reduced ? 0 : -8 }}
        transition={{
          duration: reduced ? 0 : 0.32,
          ease: [0.22, 1, 0.36, 1],
          layout: { duration: reduced ? 0 : 0.24 },
        }}
      >
        <button
          className="back-button"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <span aria-hidden="true">←</span> Back
        </button>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={viewKey}
            initial={{ opacity: 0, y: reduced ? 0 : 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduced ? 0 : -3 }}
            transition={{ duration: reduced ? 0 : 0.12 }}
          >
            <h2 id={id}>{title}</h2>
            {children}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
