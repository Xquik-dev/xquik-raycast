import { describe, expect, test } from "bun:test";
import manifest from "../package.json";

describe("manifest", () => {
  test("lists only macOS while a command runs in the menu bar", () => {
    const menuBarCommands = manifest.commands.filter(({ mode }) => mode === "menu-bar").map(({ name }) => name);
    expect(manifest.platforms.includes("Windows") ? menuBarCommands : []).toEqual([]);
  });

  test("opens each command from the root search with its own letter", () => {
    const letters = manifest.commands.map(({ keywords }) => keywords.find((keyword) => /^[a-z]$/u.test(keyword)));
    expect(new Set(letters).size).toBe(manifest.commands.length);
    expect(letters.filter((letter) => letter === undefined)).toEqual([]);
  });
});
