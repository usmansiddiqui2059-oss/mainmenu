import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Title } from "../src/screens/Title";
import { useMenuStore, defaultPreferences } from "../src/store/menuStore";
import { MenuRenderer } from "../src/controlroom/renderer";
import { mulberry32 } from "../src/engine/rng";
import {
  menuSchema,
  menu,
  preferencesSchema,
  saveSchema,
} from "../src/schemas/menu";
beforeEach(() => {
  localStorage.clear();
  useMenuStore.setState({ preferences: { ...defaultPreferences }, save: null });
});
describe("Main menu", () => {
  it("exposes exactly five choices without the discarded credits or numbering", () => {
    render(<Title />);
    for (const label of [
      "Play Game",
      "Continue Game",
      "Sandbox mode",
      "Settings",
      "About the event",
    ])
      expect(screen.getByRole("button", { name: label })).toBeTruthy();
    expect(screen.queryByText("Brown Ninjas")).toBeNull();
    expect(screen.getAllByRole("button")).toHaveLength(5);
    expect(
      document.querySelector(
        "header,footer,.menu-index,.scene-caption,.scene-grain",
      ),
    ).toBeNull();
  });
  it("selects the required scene on hover and restores launch after leaving", async () => {
    vi.useFakeTimers();
    const scene = vi.spyOn(MenuRenderer.prototype, "setScene");
    render(<Title />);
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    for (const [label, id] of [
      ["Play Game", "orbit"],
      ["Continue Game", "orbit"],
      ["Sandbox mode", "mars"],
      ["Settings", "workshop"],
      ["About the event", "event"],
    ]) {
      fireEvent.pointerEnter(screen.getByRole("button", { name: label }));
      act(() => vi.advanceTimersByTime(menu.animation.hoverDelayMs + 1));
      expect(scene).toHaveBeenLastCalledWith(id);
    }
    fireEvent.pointerLeave(screen.getByRole("navigation"));
    expect(scene).toHaveBeenLastCalledWith("launch");
    scene.mockRestore();
  });
  it("supports arrow navigation, Home and End", () => {
    render(<Title />);
    const play = screen.getByRole("button", { name: "Play Game" });
    act(() => play.focus());
    fireEvent.keyDown(play, { key: "ArrowDown" });
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Continue Game" }),
    );
    fireEvent.keyDown(document.activeElement!, { key: "End" });
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "About the event" }),
    );
    fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
    expect(document.activeElement).toBe(play);
  });
  it("explains an empty save without pretending a game exists", async () => {
    const user = userEvent.setup();
    render(<Title />);
    await user.click(screen.getByRole("button", { name: "Continue Game" }));
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByText(/No saved mission/)).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Start a new game" }));
    expect(
      await screen.findByRole("group", { name: "Destination" }),
    ).toBeTruthy();
  });
  it("creates a local campaign and invokes the integration callback", async () => {
    const user = userEvent.setup(),
      onNewGame = vi.fn();
    render(<Title onNewGame={onNewGame} />);
    await user.click(screen.getByRole("button", { name: "Play Game" }));
    await user.click(screen.getByRole("button", { name: /Mars/ }));
    await user.click(screen.getByRole("button", { name: "Begin expedition" }));
    expect(onNewGame).toHaveBeenCalledOnce();
    expect(onNewGame.mock.calls[0][0]).toMatchObject({
      destination: "mars",
      mode: "campaign",
    });
    expect(useMenuStore.getState().save?.destination).toBe("mars");
    expect(
      JSON.parse(localStorage.getItem("mission-control-menu-v1")!).state.save
        .destination,
    ).toBe("mars");
  });
  it("creates a sandbox and resumes only an existing save", async () => {
    const user = userEvent.setup(),
      onSandbox = vi.fn(),
      onContinueGame = vi.fn();
    render(<Title onSandbox={onSandbox} onContinueGame={onContinueGame} />);
    await user.click(screen.getByRole("button", { name: "Sandbox mode" }));
    await user.click(screen.getByRole("button", { name: "Enter Sandbox" }));
    expect(onSandbox.mock.calls[0][0].mode).toBe("sandbox");
    await user.click(screen.getByRole("button", { name: "Continue Game" }));
    expect(onContinueGame.mock.calls[0][0]).toEqual(onSandbox.mock.calls[0][0]);
  });
  it("persists preferences and supports Escape with focus restoration", async () => {
    const user = userEvent.setup();
    render(<Title />);
    const settings = screen.getByRole("button", { name: "Settings" });
    await user.click(settings);
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Close dialog" }),
      ),
    );
    await user.click(screen.getByRole("switch", { name: "Scene animation" }));
    expect(useMenuStore.getState().preferences.motion).toBe(false);
    expect(
      JSON.parse(localStorage.getItem("mission-control-menu-v1")!).state
        .preferences.motion,
    ).toBe(false);
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(document.activeElement).toBe(settings);
  });
  it("traps Tab inside dialogs", async () => {
    const user = userEvent.setup();
    render(<Title />);
    await user.click(screen.getByRole("button", { name: "Settings" }));
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Close dialog" }),
      ),
    );
    await user.keyboard("{Shift>}{Tab}{/Shift}");
    expect(document.activeElement).toBe(screen.getByLabelText("Menu text"));
    await user.keyboard("{Tab}");
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Close dialog" }),
    );
  });
  it("uses the host game's supplied save instead of standalone demo metadata", async () => {
    const user = userEvent.setup(),
      onContinueGame = vi.fn();
    const mission = {
      destination: "mars",
      mode: "campaign",
      startedAt: "2026-11-14T10:00:00.000Z",
    } as const;
    render(<Title savedMission={mission} onContinueGame={onContinueGame} />);
    await user.click(screen.getByRole("button", { name: "Continue Game" }));
    expect(onContinueGame).toHaveBeenCalledWith(mission);
  });
  it("accepts legacy preferences while dropping the removed sound settings", async () => {
    localStorage.setItem(
      "mission-control-menu-v1",
      JSON.stringify({
        state: {
          preferences: {
            motion: false,
            scale: "compact",
            sound: true,
            volume: 0.8,
          },
          save: null,
        },
        version: 0,
      }),
    );
    await useMenuStore.persist.rehydrate();
    expect(useMenuStore.getState().preferences).toEqual({
      motion: false,
      scale: "compact",
    });
  });
  it("rejects corrupt persisted state and recovers defaults", async () => {
    localStorage.setItem(
      "mission-control-menu-v1",
      JSON.stringify({
        state: {
          preferences: { motion: "bad" },
          save: { destination: "pluto" },
        },
        version: 0,
      }),
    );
    await useMenuStore.persist.rehydrate();
    expect(useMenuStore.getState().preferences).toEqual(defaultPreferences);
    expect(useMenuStore.getState().save).toBeNull();
  });
  it("provides a useful standalone mission staging screen", async () => {
    const user = userEvent.setup();
    render(<Title />);
    await user.click(screen.getByRole("button", { name: "Play Game" }));
    await user.click(screen.getByRole("button", { name: "Begin expedition" }));
    expect(await screen.findByText("Mission ready")).toBeTruthy();
    await user.click(
      screen.getByRole("button", { name: "Return to main menu" }),
    );
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });
});
describe("Data contracts", () => {
  it("validates every content configuration", () => {
    expect(menuSchema.safeParse(menu).success).toBe(true);
    expect(
      preferencesSchema.safeParse({ ...defaultPreferences, scale: "huge" })
        .success,
    ).toBe(false);
    expect(
      saveSchema.safeParse({
        destination: "mars",
        mode: "campaign",
        startedAt: "bad",
      }).success,
    ).toBe(false);
  });
  it("keeps visual noise reproducible", () => {
    const a = mulberry32(2026),
      b = mulberry32(2026);
    for (let i = 0; i < 50; i++) {
      const v = a();
      expect(v).toBe(b());
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});
