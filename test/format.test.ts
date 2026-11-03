import { describe, expect, test } from "bun:test";
import {
  compactCount,
  compactFeedPage,
  escapeMarkdown,
  followMarkdown,
  formatDay,
  postLink,
  postMarkdown,
  postMetrics,
  postTitle,
  profileMarkdown,
  repostedFrom,
} from "../src/lib/format";

describe("compactCount", () => {
  const cases = [
    [0, "0"],
    [999, "999"],
    [1000, "1K"],
    [9775, "9.8K"],
    [1291231, "1.3M"],
    [92376194, "92.4M"],
  ] as const;
  for (const [count, text] of cases) {
    test(`${count} reads as ${text}`, () => expect(compactCount(count)).toBe(text));
  }
});

describe("formatDay", () => {
  test("reads the date format X sends", () => {
    expect(formatDay("Tue Nov 03 12:05:04 +0000 2026")).toBe("Nov 3, 2026");
  });
});

describe("postTitle", () => {
  test("joins a post onto 1 line", () => {
    expect(postTitle("  This galaxy\n\nis a little   extra. ")).toBe("This galaxy is a little extra.");
  });

  test("names a post with no text", () => {
    expect(postTitle("  ")).toBe("Post");
  });

  test("drops a repost's RT prefix", () => {
    expect(postTitle("RT @WhiteHouse: AMERICA IS GOING BACK TO THE MOON.")).toBe("AMERICA IS GOING BACK TO THE MOON.");
  });
});

describe("repostedFrom", () => {
  test("names the original author of a repost", () => {
    expect(repostedFrom("RT @NASAArtemis: Crews train for the Moon.")).toBe("NASAArtemis");
  });

  test("finds no original author in a post", () => {
    expect(repostedFrom("Meet Messier 106. RT @NASA: later")).toBeUndefined();
  });
});

describe("escapeMarkdown", () => {
  const cases = [
    ["#AI is *big* and _wide_", "\\#AI is \\*big\\* and \\_wide\\_"],
    ["[link](https://x.com)", "\\[link\\](https://x.com)"],
    ["`code`", "\\`code\\`"],
    ["a \\ b", "a \\\\ b"],
    ["<b>bold</b>", "\\<b\\>bold\\</b\\>"],
    ["AT&amp;T", "AT\\&amp;T"],
    ["- item", "\\- item"],
    ["+ item", "\\+ item"],
    ["1. item", "1\\. item"],
    ["2) item", "2\\) item"],
    ["> quote", "\\> quote"],
    ["===", "\\==="],
    ["    indented", "indented"],
    ["https://t.co/421Lzs0r0c", "https://t.co/421Lzs0r0c"],
  ] as const;
  for (const [text, escaped] of cases) {
    test(`keeps ${JSON.stringify(text)} literal`, () => expect(escapeMarkdown(text)).toBe(escaped));
  }

  test("keeps each post line on its own line", () => {
    expect(escapeMarkdown("one\ntwo")).toBe("one  \ntwo");
  });
});

describe("postMarkdown", () => {
  test("adds an image for each photo and skips video previews", () => {
    const markdown = postMarkdown({
      id: "1",
      text: "#space",
      media: [
        { type: "photo", mediaUrl: "https://pbs.twimg.com/media/a.jpg" },
        { type: "video", mediaUrl: "https://pbs.twimg.com/media/b.jpg" },
      ],
    });
    expect(markdown).toBe("\\#space\n\n![](https://pbs.twimg.com/media/a.jpg)");
  });
});

describe("profileMarkdown", () => {
  test("shows the avatar, name, username and bio", () => {
    expect(
      profileMarkdown({
        id: "1",
        username: "some_user",
        name: "Some *Name*",
        profilePicture: "https://pbs.twimg.com/a.jpg",
        description: "Bio #1",
      }),
    ).toBe("![](https://pbs.twimg.com/a.jpg)\n\n# Some \\*Name\\*\n\n@some\\_user\n\nBio \\#1");
  });

  test("leaves out what the account does not have", () => {
    expect(profileMarkdown({ id: "1", username: "NASA", name: "NASA" })).toBe("# NASA\n\n@NASA");
  });
});

describe("followMarkdown", () => {
  test("states both directions in plain words", () => {
    expect(
      followMarkdown({ sourceUsername: "nasa", targetUsername: "spacex", isFollowing: false, isFollowedBy: true }),
    ).toBe("# @nasa and @spacex\n\n@nasa does not follow @spacex.\n\n@spacex follows @nasa.");
  });
});

describe("postMetrics", () => {
  test("lists the counts in order and skips what X does not show", () => {
    expect(postMetrics({ id: "1", text: "x", likeCount: 9043, retweetCount: 0, viewCount: null })).toEqual([
      { title: "Likes", count: "9K" },
      { title: "Reposts", count: "0" },
    ]);
  });
});

describe("postLink", () => {
  test("uses the post's own link", () => {
    expect(postLink({ id: "2", text: "x", url: "https://x.com/NASA/status/2" })).toBe("https://x.com/NASA/status/2");
  });

  test("builds a link when the API sends none", () => {
    expect(postLink({ id: "2", text: "x" })).toBe("https://x.com/i/status/2");
  });
});

describe("compactFeedPage", () => {
  test("gives the AI the compact post shape and the cursor", () => {
    const page = compactFeedPage({
      nextCursor: "next",
      posts: [
        {
          id: "2",
          url: "https://x.com/NASA/status/2",
          text: "Hello",
          createdAt: "Wed Sep 23 22:07:23 +0000 2026",
          likeCount: 1,
          retweetCount: 2,
          replyCount: 3,
          viewCount: 4,
          author: { id: "11348282", username: "NASA", name: "NASA" },
        },
      ],
    });
    expect(page).toEqual({
      nextCursor: "next",
      posts: [
        {
          id: "2",
          url: "https://x.com/NASA/status/2",
          text: "Hello",
          author: "NASA",
          createdAt: "Wed Sep 23 22:07:23 +0000 2026",
          likes: 1,
          reposts: 2,
          replies: 3,
          views: 4,
        },
      ],
    });
  });
});
