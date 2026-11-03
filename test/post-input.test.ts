import { describe, expect, test } from "bun:test";

const { postFromClipboard } = await import("../src/lib/post-input");
const { savedMediaMessage } = await import("../src/lib/format");

describe("postFromClipboard", () => {
  const links: [string, string][] = [
    ["https://x.com/NASA/status/2102882545427714266", "2102882545427714266"],
    ["https://twitter.com/NASA/status/2102882545427714266?s=20", "2102882545427714266"],
    ["  https://mobile.x.com/NASA/status/2102882545427714266/photo/1\n", "2102882545427714266"],
    ["https://x.com/i/web/status/2102882545427714266", "2102882545427714266"],
    ["https://www.twitter.com/nike/statuses/1234", "1234"],
  ];
  for (const [text, id] of links) {
    test(`reads ${id} from ${text.trim()}`, () => {
      expect(postFromClipboard(text)).toBe(id);
    });
  }

  for (const text of [undefined, "", "2102882545427714266", "https://x.com/NASA", "see https://x.com/NASA/status/1"]) {
    test(`ignores ${JSON.stringify(text)}`, () => {
      expect(postFromClipboard(text)).toBeUndefined();
    });
  }
});

describe("savedMediaMessage", () => {
  test("names the file count", () => {
    expect(savedMediaMessage(0)).toBe("This Post Has No Media");
    expect(savedMediaMessage(1)).toBe("Saved 1 File to Downloads");
    expect(savedMediaMessage(4)).toBe("Saved 4 Files to Downloads");
  });
});
