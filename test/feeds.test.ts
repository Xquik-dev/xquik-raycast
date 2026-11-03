import { afterEach, describe, expect, test } from "bun:test";

const { advancedFeed, feedKey, feedRequest, fetchFeedPage, fetchPost, uniqueById } = await import("../src/lib/feeds");

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

function stubPages(pages: unknown[]): URL[] {
  const urls: URL[] = [];
  globalThis.fetch = (async (url: URL | string) => {
    urls.push(new URL(String(url)));
    return new Response(JSON.stringify(pages.shift()));
  }) as typeof fetch;
  return urls;
}

const nasaPost = { id: "2102882545427714266", text: "This galaxy is a little extra." };

describe("feedRequest", () => {
  test("search sends the query, sort and filters by their API names", () => {
    const { path, query } = feedRequest({
      kind: "search",
      query: "artemis",
      sort: "Top",
      filters: { fromUser: "NASA", minLikes: 100, minRetweets: 5, mediaType: "images", replies: "exclude" },
    });
    expect(path).toBe("/x/tweets/search");
    expect(query).toEqual({
      q: "artemis",
      queryType: "Top",
      fromUser: "NASA",
      minLikes: 100,
      minRetweets: 5,
      mediaType: "images",
      replies: "exclude",
      limit: 20,
    });
  });

  test("a filter-only search still sends q, with a bound that matches every post", () => {
    const { query } = feedRequest({ kind: "search", query: "", sort: "Latest", filters: { fromUser: "NASA" } });
    expect(query.q).toBe("since:2006-03-21");
  });

  const routes = [
    [{ kind: "userPosts", user: "@NASA" }, "/x/users/%40NASA/tweets"],
    [{ kind: "mentions", user: "NASA" }, "/x/users/NASA/mentions"],
    [{ kind: "replies", post: "2102882545427714266" }, "/x/tweets/2102882545427714266/replies"],
    [{ kind: "quotes", post: "2102882545427714266" }, "/x/tweets/2102882545427714266/quotes"],
    [{ kind: "thread", post: "2102882545427714266" }, "/x/tweets/2102882545427714266/thread"],
  ] as const;

  for (const [feed, path] of routes) {
    test(`${feed.kind} reads ${path} 20 at a time`, () => {
      expect(feedRequest(feed)).toEqual({ path, query: { limit: 20 } });
    });
  }

  test("encodes a profile link as 1 path segment", () => {
    expect(feedRequest({ kind: "userPosts", user: "https://x.com/nasa" }).path).toBe(
      "/x/users/https%3A%2F%2Fx.com%2Fnasa/tweets",
    );
  });

  test("encodes a post link as 1 path segment", () => {
    expect(feedRequest({ kind: "replies", post: "https://x.com/NASA/status/20?s=1" }).path).toBe(
      "/x/tweets/https%3A%2F%2Fx.com%2FNASA%2Fstatus%2F20%3Fs%3D1/replies",
    );
  });
});

describe("fetchFeedPage", () => {
  test("returns the posts and the next cursor, and sends a given cursor", async () => {
    const urls = stubPages([{ tweets: [nasaPost], has_next_page: true, next_cursor: "next" }]);
    const page = await fetchFeedPage({ kind: "userPosts", user: "NASA" }, "start");
    expect(page.posts.map(({ id }) => id)).toEqual(["2102882545427714266"]);
    expect(page.nextCursor).toBe("next");
    expect(urls[0].searchParams.get("cursor")).toBe("start");
  });

  test("ends the feed when the API reports no more pages", async () => {
    stubPages([{ tweets: [nasaPost], has_next_page: false, next_cursor: "" }]);
    expect((await fetchFeedPage({ kind: "userPosts", user: "NASA" })).nextCursor).toBeUndefined();
  });

  test("follows an empty page that reports more", async () => {
    const urls = stubPages([
      { tweets: [], has_next_page: true, next_cursor: "second" },
      { tweets: [nasaPost], has_next_page: false, next_cursor: "" },
    ]);
    const page = await fetchFeedPage({ kind: "mentions", user: "NASA" });
    expect(page.posts).toHaveLength(1);
    expect(urls.map((url) => url.searchParams.get("cursor"))).toEqual([null, "second"]);
  });

  test("returns an empty feed when the last page is empty", async () => {
    const urls = stubPages([{ tweets: [], has_next_page: false, next_cursor: "" }]);
    expect((await fetchFeedPage({ kind: "mentions", user: "NASA" })).posts).toEqual([]);
    expect(urls).toHaveLength(1);
  });
});

describe("fetchPost", () => {
  test("joins the top-level author to the post", async () => {
    stubPages([{ tweet: nasaPost, author: { id: "11348282", username: "NASA", name: "NASA" } }]);
    const post = await fetchPost("https://x.com/NASA/status/2102882545427714266");
    expect(post.id).toBe("2102882545427714266");
    expect(post.author?.username).toBe("NASA");
  });

  test("keeps a post whose author is unavailable", async () => {
    stubPages([{ tweet: nasaPost }]);
    expect((await fetchPost("2102882545427714266")).author).toBeUndefined();
  });
});

describe("uniqueById", () => {
  test("keeps the first copy of a post that comes back on a later page", () => {
    const pinned = { ...nasaPost, id: "1" };
    const posts = uniqueById([pinned, { ...nasaPost, id: "2" }, pinned]);
    expect(posts.map(({ id }) => id)).toEqual(["1", "2"]);
  });
});

describe("feedKey", () => {
  test("is equal for equal feeds and differs between feeds", () => {
    expect(feedKey({ kind: "thread", post: "1" })).toBe(feedKey({ kind: "thread", post: "1" }));
    expect(feedKey({ kind: "thread", post: "1" })).not.toBe(feedKey({ kind: "quotes", post: "1" }));
  });
});

describe("advancedFeed", () => {
  const blank = {
    query: "",
    from: "",
    mentioning: "",
    language: "",
    since: null,
    until: null,
    minLikes: "",
    minReposts: "",
    media: "",
    sort: "Latest",
    excludeReplies: false,
  };

  test("refuses a form with no criterion", () => {
    expect(advancedFeed(blank)).toBeUndefined();
    expect(advancedFeed({ ...blank, excludeReplies: true, sort: "Top" })).toBeUndefined();
  });

  test("turns every field into its API filter", () => {
    const feed = advancedFeed({
      query: " artemis ",
      from: "NASA",
      mentioning: "SpaceX",
      language: "en",
      since: new Date(2026, 0, 2),
      until: new Date(2026, 11, 31),
      minLikes: "100",
      minReposts: "5",
      media: "videos",
      sort: "Top",
      excludeReplies: true,
    });
    expect(feed).toEqual({
      kind: "search",
      query: "artemis",
      sort: "Top",
      filters: {
        fromUser: "NASA",
        mentioning: "SpaceX",
        language: "en",
        sinceDate: "2026-01-02",
        untilDate: "2026-12-31",
        minLikes: 100,
        minRetweets: 5,
        mediaType: "videos",
        replies: "exclude",
      },
    });
  });

  test("accepts a single filter", () => {
    expect(advancedFeed({ ...blank, minLikes: "0" })?.filters.minLikes).toBe(0);
  });
});
