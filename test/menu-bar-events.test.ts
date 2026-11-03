import { describe, expect, test } from "bun:test";

const { newestEventDate, unseenEvents } = await import("../src/lib/events");

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
