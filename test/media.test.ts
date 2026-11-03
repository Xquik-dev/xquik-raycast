import { afterEach, describe, expect, mock, test } from "bun:test";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

mock.module("@raycast/api", () => ({ getPreferenceValues: () => ({ apiKey: "xq_test_key" }) }));

const { mediaFileName, saveMedia } = await import("../src/lib/media");

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

describe("mediaFileName", () => {
  test("names a file by post and position, with the extension of its URL", () => {
    const item = { tweetId: "1234567890", mediaType: "photo", mediaUrl: "https://media.xquik.com/t/0.png?v=1" };
    expect(mediaFileName(item, 2)).toBe("xquik-1234567890-2.png");
  });

  test("falls back to the media type", () => {
    const item = { tweetId: "1234567890", mediaType: "video", mediaUrl: "https://media.xquik.com/t/0" };
    expect(mediaFileName(item, 0)).toBe("xquik-1234567890-0.mp4");
  });
});

describe("saveMedia", () => {
  test("asks for the post's files and writes each 1 to the folder", async () => {
    const folder = await mkdtemp(join(tmpdir(), "xquik-media-"));
    const posts: unknown[] = [];
    globalThis.fetch = (async (url: URL | string, init?: RequestInit) => {
      if (String(url).startsWith("https://media.xquik.com/")) return new Response(String(url).slice(-5));
      posts.push({ url: String(url), method: init?.method, body: init?.body });
      return new Response(
        JSON.stringify({
          tweetId: "20",
          items: [
            { tweetId: "20", mediaType: "photo", mediaUrl: "https://media.xquik.com/tweet_20/0.jpg" },
            { tweetId: "20", mediaType: "video", mediaUrl: "https://media.xquik.com/tweet_20/1.mp4" },
          ],
        }),
      );
    }) as typeof fetch;

    try {
      const paths = await saveMedia("20", folder);
      expect(posts).toEqual([
        { url: "https://xquik.com/api/v1/x/media/download", method: "POST", body: '{"tweetInput":"20"}' },
      ]);
      expect(paths).toEqual([join(folder, "xquik-20-0.jpg"), join(folder, "xquik-20-1.mp4")]);
      expect((await readdir(folder)).sort()).toEqual(["xquik-20-0.jpg", "xquik-20-1.mp4"]);
      expect(await readFile(paths[0], "utf8")).toBe("0.jpg");
    } finally {
      await rm(folder, { recursive: true });
    }
  });
});
