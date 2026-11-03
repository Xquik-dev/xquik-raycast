import { beforeEach, describe, expect, test } from "bun:test";

import { host } from "./raycast-api";

const { SITE_URL } = await import("../src/lib/api");
const { showErrorToast } = await import("../src/lib/error-toast");
const { XquikError } = await import("../src/lib/errors");

beforeEach(() => host.reset());

describe("the Xquik link", () => {
  test("is the bare site", () => {
    expect(SITE_URL).toBe("https://xquik.com");
  });

  for (const kind of ["credits", "paused"] as const) {
    test(`the ${kind} toast opens exactly https://xquik.com`, async () => {
      await showErrorToast(new XquikError(kind), () => undefined);
      expect(host.toasts[0].primaryAction.title).toBe("Open Xquik");
      host.toasts[0].primaryAction.onAction({});
      expect(host.opened).toEqual(["https://xquik.com"]);
    });
  }
});

describe("showErrorToast", () => {
  test("shows the title and the server message", async () => {
    await showErrorToast(new XquikError("credits", "Insufficient credits."), () => undefined);
    expect(host.toasts[0].title).toBe("Out of Credits");
    expect(host.toasts[0].message).toBe("Insufficient credits.");
  });

  test("an auth failure opens the extension preferences", async () => {
    await showErrorToast(new XquikError("auth"), () => undefined);
    host.toasts[0].primaryAction.onAction({});
    expect(host.preferencesOpened).toBe(1);
    expect(host.opened).toEqual([]);
  });

  test("a retryable failure hides the toast and retries", async () => {
    let retries = 0;
    let hides = 0;
    await showErrorToast(new XquikError("rateLimited"), () => {
      retries += 1;
    });
    host.toasts[0].primaryAction.onAction({ hide: () => (hides += 1) });
    expect(retries).toBe(1);
    expect(hides).toBe(1);
  });
});
