import { describe, expect, test } from "bun:test";

const { matchingRecents, withRecent } = await import("../src/lib/recents");

describe("withRecent", () => {
  test("puts the newest search first", () => {
    expect(withRecent(["nasa", "nike"], " artemis ")).toEqual(["artemis", "nasa", "nike"]);
  });

  test("moves a repeated search to the top, ignoring case", () => {
    expect(withRecent(["nasa", "Nike", "artemis"], "nike")).toEqual(["nike", "nasa", "artemis"]);
  });

  test("keeps the 8 newest searches", () => {
    const recents = ["1", "2", "3", "4", "5", "6", "7", "8"];
    expect(withRecent(recents, "new")).toEqual(["new", "1", "2", "3", "4", "5", "6", "7"]);
  });

  test("skips a blank search", () => {
    expect(withRecent(["nasa"], "  ")).toEqual(["nasa"]);
  });
});

describe("matchingRecents", () => {
  test("lists every recent search for an empty draft", () => {
    expect(matchingRecents(["nasa", "nike"], " ")).toEqual(["nasa", "nike"]);
  });

  test("keeps searches that contain the draft, ignoring case", () => {
    expect(matchingRecents(["from:NASA artemis", "nike", "nasa moon"], "Nasa")).toEqual([
      "from:NASA artemis",
      "nasa moon",
    ]);
  });
});
