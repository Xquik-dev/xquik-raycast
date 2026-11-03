import { afterEach, describe, expect, test } from "bun:test";

const { createMonitor, deleteMonitor, fetchMonitorPage, MONITOR_KINDS, monitorTarget, setMonitorActive } =
  await import("../src/lib/monitors");

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

type Sent = { url: string; method?: string; body?: string };

function stubFetch(body: unknown): Sent[] {
  const sent: Sent[] = [];
  globalThis.fetch = (async (url: URL | string, init?: RequestInit) => {
    sent.push({ url: String(url), method: init?.method, body: init?.body as string | undefined });
    return new Response(JSON.stringify(body));
  }) as typeof fetch;
  return sent;
}

const monitor = {
  id: "42",
  username: "NASA",
  xUserId: "11348282",
  eventTypes: ["tweet.new"],
  isActive: true,
  createdAt: "2025-01-15T12:00:00Z",
  nextBillingAt: "2025-01-15T12:00:00Z",
};

const API = "https://xquik.com/api/v1";

describe("fetchMonitorPage", () => {
  const paths = [
    ["account", `${API}/monitors?limit=20&after=abc`],
    ["keyword", `${API}/monitors/keywords?limit=20&after=abc`],
  ] as const;
  for (const [kind, url] of paths) {
    test(`pages ${kind} monitors by limit and after`, async () => {
      const sent = stubFetch({ monitors: [monitor], total: 1, hasMore: true, nextCursor: "def" });
      const page = await fetchMonitorPage(kind, "abc");
      expect(sent[0].url).toBe(url);
      expect(page.monitors.map(({ id }) => id)).toEqual(["42"]);
      expect(page.nextCursor).toBe("def");
    });
  }

  test("ends when the API reports no more", async () => {
    stubFetch({ monitors: [], total: 0, hasMore: false });
    expect((await fetchMonitorPage("account")).nextCursor).toBeUndefined();
  });
});

describe("createMonitor", () => {
  test("an account monitor sends username", async () => {
    const sent = stubFetch(monitor);
    await createMonitor("account", { target: "NASA", eventTypes: ["tweet.new"] });
    expect(sent[0]).toEqual({
      url: `${API}/monitors`,
      method: "POST",
      body: '{"username":"NASA","eventTypes":["tweet.new"]}',
    });
  });

  test("a keyword monitor sends query and the name", async () => {
    const sent = stubFetch({ ...monitor, username: undefined, query: "xquik" });
    await createMonitor("keyword", { target: "xquik", name: "Launch", eventTypes: ["tweet.new"] });
    expect(sent[0]).toEqual({
      url: `${API}/monitors/keywords`,
      method: "POST",
      body: '{"query":"xquik","name":"Launch","eventTypes":["tweet.new"]}',
    });
  });
});

describe("setMonitorActive", () => {
  const paths = [
    ["account", `${API}/monitors/42`],
    ["keyword", `${API}/monitors/keywords/42`],
  ] as const;
  for (const [kind, url] of paths) {
    test(`patches a ${kind} monitor`, async () => {
      const sent = stubFetch(monitor);
      await setMonitorActive(kind, "42", false);
      expect(sent[0]).toEqual({ url, method: "PATCH", body: '{"isActive":false}' });
    });
  }
});

describe("deleteMonitor", () => {
  test("accepts the 202 deletion answer", async () => {
    const sent = stubFetch({ deletionStatus: "deleting", statusUrl: "/api/v1/monitors/42", success: true });
    await deleteMonitor("keyword", "42");
    expect(sent[0]).toEqual({ url: `${API}/monitors/keywords/42`, method: "DELETE", body: undefined });
  });
});

describe("the kind table", () => {
  test("keyword monitors offer only the 10 post event types", () => {
    expect(Object.keys(MONITOR_KINDS.keyword.eventLabels)).toEqual([
      "tweet.new",
      "tweet.reply",
      "tweet.retweet",
      "tweet.quote",
      "tweet.media",
      "tweet.link",
      "tweet.poll",
      "tweet.mention",
      "tweet.hashtag",
      "tweet.longform",
    ]);
  });

  test("account monitors offer all 30 event types", () => {
    expect(Object.keys(MONITOR_KINDS.account.eventLabels)).toHaveLength(30);
  });

  test("each kind filters events by its own ID field", () => {
    expect(MONITOR_KINDS.account.eventFilter("42")).toEqual({ monitorId: "42" });
    expect(MONITOR_KINDS.keyword.eventFilter("21")).toEqual({ keywordMonitorId: "21" });
  });
});

describe("monitorTarget", () => {
  const shared = { eventTypes: [], isActive: true, createdAt: "2025-01-15T12:00:00Z" };

  test("shows a username with its @", () => {
    expect(monitorTarget({ id: "42", username: "NASA", ...shared })).toBe("@NASA");
  });

  test("shows a keyword query as written", () => {
    expect(monitorTarget({ id: "21", query: "xquik", ...shared })).toBe("xquik");
  });
});
