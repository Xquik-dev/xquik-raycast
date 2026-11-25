import { afterEach, describe, expect, test } from "bun:test";
import fc from "fast-check";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

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

  test("falls back to the media type when the URL's extension holds more than letters and digits", () => {
    const item = { tweetId: "1234567890", mediaType: "photo", mediaUrl: "https://media.xquik.com/t/0.j%2Fpg" };
    expect(mediaFileName(item, 1)).toBe("xquik-1234567890-1.jpg");
  });

  test("names every file inside its folder, whatever URL the API gives", () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^\d{1,19}$/),
        fc.nat(50),
        fc.constantFrom("photo", "video", "animated_gif"),
        fc.webUrl({ withQueryParameters: true, withFragments: true }),
        (tweetId, index, mediaType, mediaUrl) => {
          expect(mediaFileName({ tweetId, mediaType, mediaUrl }, index)).toMatch(/^xquik-\d+-\d+\.[a-z0-9]{1,8}$/i);
        },
      ),
    );
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

  test("writes nothing when the API names a post ID that would leave the folder", async () => {
    const parent = await mkdtemp(join(tmpdir(), "xquik-media-"));
    const folder = join(parent, "Downloads");
    const fetched: string[] = [];
    globalThis.fetch = (async (url: URL | string) => {
      fetched.push(String(url));
      return new Response(
        JSON.stringify({
          items: [{ tweetId: "/../../evil", mediaType: "photo", mediaUrl: "https://media.xquik.com/tweet_20/0.jpg" }],
        }),
      );
    }) as typeof fetch;

    try {
      await expect(saveMedia("20", folder)).rejects.toMatchObject({ kind: "unexpected" });
      expect(fetched).toEqual(["https://xquik.com/api/v1/x/media/download"]);
      expect(await readdir(parent)).toEqual([]);
    } finally {
      await rm(parent, { recursive: true });
    }
  });
});
