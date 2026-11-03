import { describe, expect, test } from "bun:test";
import { monitorSchema, postPageSchema, postSchema, profileSchema, trendListSchema } from "../src/lib/schemas";

const nasa = { id: "11348282", username: "NASA", name: "NASA" };

describe("postSchema", () => {
  test("keeps the read fields of a recorded public post and drops the rest", () => {
    const post = postSchema.parse({
      id: "2102882545427714266",
      text: "This galaxy is a little extra.",
      url: "https://x.com/NASA/status/2102882545427714266",
      retweetCount: 772,
      replyCount: 207,
      likeCount: 9043,
      quoteCount: 100,
      viewCount: 1291231,
      bookmarkCount: 661,
      createdAt: "Wed Sep 23 22:07:23 +0000 2026",
      lang: "en",
      author: { ...nasa, followers: 92376194, profilePicture: "https://pbs.twimg.com/profile_images/n.jpg" },
      media: [{ mediaUrl: "https://pbs.twimg.com/media/a.jpg", type: "photo", url: "https://t.co/QQGjcE6KKq" }],
    });
    expect(post.likeCount).toBe(9043);
    expect(post.author).toEqual({
      ...nasa,
      profilePicture: "https://pbs.twimg.com/profile_images/n.jpg",
    });
    expect(post.media).toEqual([{ mediaUrl: "https://pbs.twimg.com/media/a.jpg", type: "photo" }]);
    expect(Object.keys(post)).not.toContain("lang");
  });

  test("accepts null and absent optional fields", () => {
    const post = postSchema.parse({
      id: "1",
      text: "Hello",
      url: null,
      createdAt: null,
      likeCount: null,
      viewCount: null,
      media: null,
      author: null,
    });
    expect(post.likeCount).toBeNull();
    expect(post.retweetCount).toBeUndefined();
  });

  test("refuses a profile, so an event row can tell the two apart", () => {
    expect(postSchema.safeParse({ ...nasa, description: "Space" }).success).toBe(false);
  });
});

describe("postPageSchema", () => {
  test("accepts a last page with an empty cursor", () => {
    const page = postPageSchema.parse({ tweets: [], has_next_page: false, next_cursor: "" });
    expect(page.next_cursor).toBe("");
  });
});

describe("profileSchema", () => {
  test("reads contact links and emails", () => {
    const profile = profileSchema.parse({
      ...nasa,
      followers: 92376194,
      accountBasedIn: null,
      contactInfo: {
        links: [{ url: "http://www.nasa.gov/", network: "website", source: "url" }],
        emails: [{ value: "press@example.com", domain: "example.com", source: "bio" }],
      },
    });
    expect(profile.contactInfo?.links).toEqual([{ url: "http://www.nasa.gov/", network: "website" }]);
    expect(profile.contactInfo?.emails).toEqual([{ value: "press@example.com" }]);
  });

  test("accepts a profile with no optional fields", () => {
    expect(profileSchema.parse({ ...nasa, contactInfo: null }).contactInfo).toBeNull();
  });
});

describe("trendListSchema", () => {
  test("accepts a null volume", () => {
    const { trends } = trendListSchema.parse({
      count: 1,
      woeid: 1,
      trends: [{ name: "#AI", query: "%23AI", rank: 1, tweetVolume: null, url: "https://x.com/search?q=%23AI" }],
    });
    expect(trends[0].tweetVolume).toBeNull();
  });
});

describe("monitorSchema", () => {
  test("reads an account monitor and a keyword monitor", () => {
    const shared = { eventTypes: ["tweet.new"], isActive: true, createdAt: "2025-01-15T12:00:00Z" };
    expect(monitorSchema.parse({ id: "42", username: "NASA", ...shared }).username).toBe("NASA");
    expect(monitorSchema.parse({ id: "21", query: "xquik", ...shared }).query).toBe("xquik");
  });
});
