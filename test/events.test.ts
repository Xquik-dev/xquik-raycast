import { afterEach, describe, expect, mock, test } from "bun:test";

mock.module("@raycast/api", () => ({ getPreferenceValues: () => ({ apiKey: "xq_test_key" }) }));

const { eventLabel, eventPost, fetchEventPage } = await import("../src/lib/events");

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

const shared = { id: "1", type: "tweet.new", occurredAt: "2026-11-03T01:05:04.000Z" };

describe("eventLabel", () => {
  const cases = [
    ["tweet.new", "New Post"],
    ["tweet.retweet", "New Repost"],
    ["profile.pinned_tweet.changed", "Pinned Post Changed"],
    ["follower.removed", "Follower Lost"],
    ["post.retweets.changed", "Reposts Changed"],
  ] as const;
  for (const [type, label] of cases) {
    test(`${type} reads as ${label}`, () => expect(eventLabel(type)).toBe(label));
  }

  test("keeps the raw type of an unknown value", () => {
    expect(eventLabel("space.ended")).toBe("space.ended");
  });
});

describe("eventPost", () => {
  test("reads the post of a post event", () => {
    const data = { id: "2102882545427714266", text: "Hello", extra: true };
    expect(eventPost({ ...shared, data })?.text).toBe("Hello");
  });

  test("finds no post in a profile event", () => {
    const data = { id: "11348282", username: "NASA", name: "NASA", description: "Space" };
    expect(eventPost({ ...shared, type: "follower.added", data })).toBeUndefined();
  });
});

describe("fetchEventPage", () => {
  test("filters by monitor and pages by limit and after", async () => {
    const urls: string[] = [];
    globalThis.fetch = (async (url: URL | string) => {
      urls.push(String(url));
      return new Response(JSON.stringify({ events: [{ ...shared, data: {} }], hasMore: true, nextCursor: "next" }));
    }) as typeof fetch;
    const page = await fetchEventPage({ keywordMonitorId: "21" }, "abc");
    expect(urls).toEqual(["https://xquik.com/api/v1/events?keywordMonitorId=21&limit=20&after=abc"]);
    expect(page.nextCursor).toBe("next");
    expect(page.events).toHaveLength(1);
  });
});
