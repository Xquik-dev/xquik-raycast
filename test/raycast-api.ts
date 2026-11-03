import { mock } from "bun:test";

type ShownToast = {
  title: string;
  message: string;
  primaryAction: { title: string; onAction: (toast: unknown) => void };
};

export const host = {
  opened: [] as string[],
  toasts: [] as ShownToast[],
  preferencesOpened: 0,
  reset() {
    host.opened.length = 0;
    host.toasts.length = 0;
    host.preferencesOpened = 0;
  },
};

// Bun runs every test file in 1 process, so 1 stand-in for Raycast must carry every export the source imports.
mock.module("@raycast/api", () => ({
  Action: { Style: { Regular: "regular", Destructive: "destructive" } },
  getPreferenceValues: () => ({ apiKey: "xq_test_key" }),
  open: async (target: string) => {
    host.opened.push(target);
  },
  openExtensionPreferences: async () => {
    host.preferencesOpened += 1;
  },
  showToast: async (options: ShownToast) => {
    host.toasts.push(options);
  },
  Toast: { Style: { Animated: "animated", Success: "success", Failure: "failure" } },
}));
