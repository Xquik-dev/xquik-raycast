import { beforeEach, describe, expect, test } from "bun:test";
import { host } from "./raycast-api";

const { launchXquikCommand } = await import("../src/lib/launch");

beforeEach(() => host.reset());

describe("launchXquikCommand", () => {
  test("opens the command", async () => {
    await launchXquikCommand("manage-monitors");
    expect(host.launched).toEqual(["manage-monitors"]);
    expect(host.toasts).toEqual([]);
  });

  test("explains a disabled command and offers its settings", async () => {
    host.disabledCommands.push("view-monitor-events");
    await launchXquikCommand("view-monitor-events");
    expect(host.launched).toEqual([]);
    expect(host.toasts.map(({ title }) => title)).toEqual(["Could Not Open View Monitor Events"]);
    host.toasts[0].primaryAction.onAction(undefined);
    expect(host.preferencesOpened).toBe(1);
  });
});
