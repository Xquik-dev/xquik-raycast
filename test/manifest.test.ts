import { describe, expect, test } from "bun:test";
import manifest from "../package.json";

describe("manifest", () => {
  test("lists only macOS while a command runs in the menu bar", () => {
    const menuBarCommands = manifest.commands.filter(({ mode }) => mode === "menu-bar").map(({ name }) => name);
    expect(manifest.platforms.includes("Windows") ? menuBarCommands : []).toEqual([]);
  });
});
