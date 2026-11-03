import { afterEach, describe, expect, test } from "bun:test";

const { confirmation: confirmCreate, default: create } = await import("../src/tools/create-monitor");
const { confirmation: confirmDelete } = await import("../src/tools/delete-monitor");
const { default: getPost } = await import("../src/tools/get-post");
const { default: getTrends } = await import("../src/tools/get-trends");
const { default: listEvents } = await import("../src/tools/list-monitor-events");
const { default: searchPosts } = await import("../src/tools/search-posts");

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

function stubFetch(body: unknown): string[] {
  const urls: string[] = [];
  globalThis.fetch = (async (url: URL | string, init?: RequestInit) => {
    urls.push(`${init?.method} ${String(url)} ${String(init?.body)}`);
    return new Response(JSON.stringify(body));
  }) as typeof fetch;
  return urls;
}

const post = {
  id: "2",
  text: "Hello",
  url: "https://x.com/NASA/status/2",
  likeCount: 1,
  author: { id: "11348282", username: "NASA", name: "NASA" },
};

describe("read tools", () => {
  test("search-posts returns compact posts and the cursor", async () => {
    const calls = stubFetch({ tweets: [post], has_next_page: true, next_cursor: "next" });
    const page = await searchPosts({ query: "from:NASA" });
    expect(calls).toEqual([
      "GET https://xquik.com/api/v1/x/tweets/search?q=from%3ANASA&queryType=Latest&limit=20 undefined",
    ]);
    expect(page.nextCursor).toBe("next");
    expect(page.posts[0].author).toBe("NASA");
    expect(page.posts[0].likes).toBe(1);
  });

  test("get-post reads 1 post by link", async () => {
    stubFetch({ tweet: post });
    expect((await getPost({ post: "https://x.com/NASA/status/2" })).url).toBe("https://x.com/NASA/status/2");
  });

  test("get-trends defaults to Worldwide", async () => {
    const calls = stubFetch({ count: 1, woeid: 1, trends: [{ name: "#AI", rank: 1, tweetVolume: 5 }] });
    expect(await getTrends({})).toEqual([{ name: "#AI", rank: 1, posts: 5, url: undefined }]);
    expect(calls[0]).toContain("/x/trends?woeid=1&count=30");
  });

  test("list-monitor-events gives a post event its post and a profile event none", async () => {
    stubFetch({
      hasMore: false,
      events: [
        { id: "1", type: "tweet.new", occurredAt: "2026-11-03T01:05:04.000Z", username: "NASA", data: post },
        { id: "2", type: "follower.added", occurredAt: "2026-11-03T01:05:04.000Z", username: "NASA", data: {} },
      ],
    });
    const { events } = await listEvents({});
    expect(events[0].type).toBe("New Post");
    expect(events[0].post?.url).toBe("https://x.com/NASA/status/2");
    expect(events[1].post).toBeUndefined();
  });
});

describe("create-monitor", () => {
  test("the confirmation states the target and the price", async () => {
    const shown = await confirmCreate({ kind: "account", target: "NASA" });
    expect(shown?.info).toEqual([
      { name: "Target", value: "NASA" },
      { name: "Cost", value: "30 credits an hour" },
    ]);
  });

  test("defaults to new posts", async () => {
    const calls = stubFetch({ id: "42", eventTypes: ["tweet.new"], isActive: true, createdAt: "2025-01-15T12:00:00Z" });
    expect(await create({ kind: "account", target: "NASA" })).toEqual({ id: "42", target: "NASA", isActive: true });
    expect(calls[0]).toBe('POST https://xquik.com/api/v1/monitors {"username":"NASA","eventTypes":["tweet.new"]}');
  });
});

describe("delete-monitor", () => {
  test("the confirmation is destructive and names the monitor its ID reads", async () => {
    const calls = stubFetch({
      id: "21",
      query: "artemis launch",
      eventTypes: ["tweet.new"],
      isActive: true,
      createdAt: "2025-01-15T12:00:00Z",
    });
    const shown = await confirmDelete({ kind: "keyword", id: "21" });
    expect(calls).toEqual(["GET https://xquik.com/api/v1/monitors/keywords/21 undefined"]);
    expect(shown?.style).toBe("destructive");
    expect(shown?.message).toBe("Delete the monitor for artemis launch?");
    expect(shown?.info).toEqual([
      { name: "Target", value: "artemis launch" },
      { name: "Monitor ID", value: "21" },
    ]);
  });
});
