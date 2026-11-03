import { beforeEach, describe, expect, mock, test } from "bun:test";

const opened: string[] = [];
type ShownToast = { title: string; message: string; primaryAction: { title: string; onAction: (toast: unknown) => void } };

const toasts: ShownToast[] = [];
let preferencesOpened = 0;

mock.module("@raycast/api", () => ({
  getPreferenceValues: () => ({ apiKey: "xq_test_key" }),
  open: async (target: string) => {
    opened.push(target);
  },
  openExtensionPreferences: async () => {
    preferencesOpened += 1;
  },
  showToast: async (options: ShownToast) => {
    toasts.push(options);
  },
  Toast: { Style: { Failure: "failure" } },
}));

const { SITE_URL } = await import("../src/lib/api");
const { showErrorToast } = await import("../src/lib/error-toast");
const { XquikError } = await import("../src/lib/errors");

beforeEach(() => {
  opened.length = 0;
  toasts.length = 0;
  preferencesOpened = 0;
});

describe("the Xquik link", () => {
  test("is the bare site", () => {
    expect(SITE_URL).toBe("https://xquik.com");
  });

  for (const kind of ["credits", "paused"] as const) {
    test(`the ${kind} toast opens exactly https://xquik.com`, async () => {
      await showErrorToast(new XquikError(kind), () => undefined);
      expect(toasts[0].primaryAction.title).toBe("Open Xquik");
      toasts[0].primaryAction.onAction({});
      expect(opened).toEqual(["https://xquik.com"]);
    });
  }
});

describe("showErrorToast", () => {
  test("shows the title and the server message", async () => {
    await showErrorToast(new XquikError("credits", "Insufficient credits."), () => undefined);
    expect(toasts[0].title).toBe("Out of Credits");
    expect(toasts[0].message).toBe("Insufficient credits.");
  });

  test("an auth failure opens the extension preferences", async () => {
    await showErrorToast(new XquikError("auth"), () => undefined);
    toasts[0].primaryAction.onAction({});
    expect(preferencesOpened).toBe(1);
    expect(opened).toEqual([]);
  });

  test("a retryable failure hides the toast and retries", async () => {
    let retries = 0;
    let hides = 0;
    await showErrorToast(new XquikError("rateLimited"), () => {
      retries += 1;
    });
    toasts[0].primaryAction.onAction({ hide: () => (hides += 1) });
    expect(retries).toBe(1);
    expect(hides).toBe(1);
  });
});
