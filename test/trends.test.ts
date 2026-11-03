import { afterEach, describe, expect, mock, test } from "bun:test";

mock.module("@raycast/api", () => ({ getPreferenceValues: () => ({ apiKey: "xq_test_key" }) }));

const { fetchTrends, TREND_PLACES, trendQuery } = await import("../src/lib/trends");

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

describe("fetchTrends", () => {
  test("asks for 30 trends of a place", async () => {
    const urls: string[] = [];
    globalThis.fetch = (async (url: URL | string) => {
      urls.push(String(url));
      return new Response(JSON.stringify({ count: 1, woeid: 23424969, trends: [{ name: "#AI" }] }));
    }) as typeof fetch;
    expect(await fetchTrends(23424969)).toEqual([{ name: "#AI" }]);
    expect(urls).toEqual(["https://xquik.com/api/v1/x/trends?woeid=23424969&count=30"]);
  });
});

describe("trendQuery", () => {
  test("decodes the query X sends", () => {
    expect(trendQuery({ name: "#WWERaw", query: "%23WWERaw" })).toBe("#WWERaw");
    expect(trendQuery({ name: "文化の日", query: "%E6%96%87%E5%8C%96%E3%81%AE%E6%97%A5" })).toBe("文化の日");
    expect(trendQuery({ name: "Steve Jobs", query: "%22Steve+Jobs%22" })).toBe('"Steve Jobs"');
  });

  test("uses the name when X sends no query", () => {
    expect(trendQuery({ name: "#AI" })).toBe("#AI");
  });
});

describe("TREND_PLACES", () => {
  test("lists the 16 places with Worldwide first", () => {
    expect(TREND_PLACES).toHaveLength(16);
    expect(TREND_PLACES[0]).toEqual({ title: "Worldwide", woeid: 1 });
  });
});
