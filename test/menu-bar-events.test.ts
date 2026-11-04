import { describe, expect, test } from "bun:test";

const { eventTypeSummary, menuEventRows, newestEventDate, unseenEvents } = await import("../src/lib/events");

const event = (id: string, occurredAt: string) => ({ id, type: "tweet.new", occurredAt, data: {} });

const events = [
  event("3", "2026-11-04T10:00:00.000Z"),
  event("2", "2026-11-04T09:00:00.000Z"),
  event("1", "2026-11-04T08:00:00.000Z"),
];

describe("unseenEvents", () => {
  test("counts every event before the first visit", () => {
    expect(unseenEvents(events, undefined).map(({ id }) => id)).toEqual(["3", "2", "1"]);
  });

  test("keeps only events after the last visit", () => {
    expect(unseenEvents(events, "2026-11-04T09:00:00.000Z").map(({ id }) => id)).toEqual(["3"]);
  });

  test("finds nothing new once the newest event is seen", () => {
    expect(unseenEvents(events, newestEventDate(events))).toEqual([]);
  });
});

describe("newestEventDate", () => {
  test("picks the latest event, whatever the order", () => {
    expect(newestEventDate([events[2], events[0], events[1]])).toBe("2026-11-04T10:00:00.000Z");
  });

  test("has no date without events", () => {
    expect(newestEventDate([])).toBeUndefined();
  });
});

describe("eventTypeSummary", () => {
  test("names a single event type", () => {
    expect(eventTypeSummary(["tweet.new"])).toBe("New Post");
  });

  test("counts several event types", () => {
    expect(eventTypeSummary(["tweet.new", "tweet.reply", "follower.added"])).toBe("3 Events");
  });
});

describe("menuEventRows", () => {
  const bioChange = (id: string) => ({
    id,
    type: "profile.bio.changed",
    occurredAt: "2026-11-04T10:05:00.000Z",
    username: "NASA",
    data: {},
  });
  const visible = (rows: { title: string; subtitle: string }[]) =>
    rows.map(({ title, subtitle }) => [title, subtitle.replace(/\s/g, " ")]);

  test("shows when each event happened", () => {
    const newPost = { ...bioChange("1"), type: "tweet.new", data: { id: "2", text: "Hello\nworld" } };
    expect(visible(menuEventRows([newPost, bioChange("2")]))).toEqual([
      ["Hello world", "New Post · Nov 4, 2026, 10:05 AM"],
      ["Bio Changed", "@NASA · Nov 4, 2026, 10:05 AM"],
    ]);
  });

  test("tells apart events that happened together", () => {
    expect(visible(menuEventRows([bioChange("3"), bioChange("2"), bioChange("1")]))).toEqual([
      ["Bio Changed", "@NASA · Nov 4, 2026, 10:05 AM"],
      ["Bio Changed", "@NASA · Nov 4, 2026, 10:05 AM (2)"],
      ["Bio Changed", "@NASA · Nov 4, 2026, 10:05 AM (3)"],
    ]);
  });

  test("never repeats a row", () => {
    const events = ["profile.bio.changed", "tweet.deleted"].flatMap((type) =>
      ["NASA", "SpaceX"].flatMap((username) =>
        ["2026-11-04T10:05:00.000Z", "2026-11-04T10:05:30.000Z"].flatMap((occurredAt) =>
          ["1", "2", "3"].map((copy) => ({
            id: `${type}-${username}-${occurredAt}-${copy}`,
            type,
            username,
            occurredAt,
            data: {},
          })),
        ),
      ),
    );
    const rows = menuEventRows(events).map(({ title, subtitle }) => JSON.stringify([title, subtitle]));
    expect(new Set(rows).size).toBe(events.length);
  });
});
