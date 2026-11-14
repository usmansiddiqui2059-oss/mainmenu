import { useEffect, useRef, type KeyboardEvent } from "react";
import { menu, type MenuAction } from "../schemas/menu";
import { Arrow } from "./Icons";
export function MenuOptions({
  selected,
  hasSave,
  onSelect,
  onActivate,
}: {
  selected: MenuAction | null;
  hasSave: boolean;
  onSelect: (action: MenuAction | null) => void;
  onActivate: (action: MenuAction) => void;
}) {
  const nav = useRef<HTMLElement>(null),
    timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const select = (id: MenuAction | null, delay = false) => {
    if (timer.current) clearTimeout(timer.current);
    if (delay)
      timer.current = setTimeout(
        () => onSelect(id),
        menu.animation.hoverDelayMs,
      );
    else onSelect(id);
  };
  const navigate = (e: KeyboardEvent<HTMLElement>) => {
    if (!["ArrowUp", "ArrowDown", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    const buttons = [
        ...nav.current!.querySelectorAll<HTMLButtonElement>("button"),
      ],
      index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    buttons[
      e.key === "Home"
        ? 0
        : e.key === "End"
          ? buttons.length - 1
          : (index + (e.key === "ArrowDown" ? 1 : -1) + buttons.length) %
            buttons.length
    ].focus();
  };
  return (
    <nav
      ref={nav}
      className="menu-options"
      aria-label="Main menu"
      onKeyDown={navigate}
      onPointerLeave={() => select(null)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) select(null);
      }}
    >
      {menu.items.map((item) => (
        <button
          key={item.id}
          data-menu-action={item.id}
          className={`menu-item ${selected === item.id ? "is-selected" : ""} ${item.id === "continue" && !hasSave ? "is-unavailable" : ""}`}
          onPointerEnter={() => select(item.id, true)}
          onFocus={() => select(item.id)}
          onClick={() => {
            select(item.id);
            onActivate(item.id);
          }}
        >
          <span>{item.label}</span>
          <span className="menu-arrow">
            <Arrow />
          </span>
        </button>
      ))}
    </nav>
  );
}
