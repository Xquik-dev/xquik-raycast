import { afterEach, describe, expect, mock, test } from "bun:test";
import { z } from "zod";

mock.module("@raycast/api", () => ({ getPreferenceValues: () => ({ apiKey: "xq_test_key" }) }));

const { request, fetchFile } = await import("../src/lib/api");
const { describeError, XquikError } = await import("../src/lib/errors");

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

type Sent = { url: string; init?: RequestInit };

function stubFetch(status: number, body: unknown): Sent[] {
  const sent: Sent[] = [];
  globalThis.fetch = (async (url: URL | string, init?: RequestInit) => {
    sent.push({ url: String(url), init });
    return new Response(typeof body === "string" ? body : JSON.stringify(body), { status });
  }) as typeof fetch;
  return sent;
}

const idSchema = z.object({ id: z.string() });

async function failure(promise: Promise<unknown>): Promise<InstanceType<typeof XquikError>> {
  const error = await promise.then(
    () => undefined,
    (reason: unknown) => reason,
  );
  if (!(error instanceof XquikError)) throw new Error(`Expected an XquikError, got ${String(error)}`);
  return error;
}

describe("request", () => {
  test("sends the key from preferences to the API", async () => {
    const sent = stubFetch(200, { id: "1" });
    await request(idSchema, "/x/users/NASA");
    expect(sent).toHaveLength(1);
    expect(sent[0].url).toBe("https://xquik.com/api/v1/x/users/NASA");
    expect((sent[0].init?.headers as Record<string, string>)["x-api-key"]).toBe("xq_test_key");
    expect(sent[0].init?.method).toBe("GET");
  });

  test("drops empty query values and keeps the rest", async () => {
    const sent = stubFetch(200, { id: "1" });
    await request(idSchema, "/x/tweets/search", { query: { q: "a b", limit: 20, cursor: undefined, language: "" } });
    expect(sent[0].url).toBe("https://xquik.com/api/v1/x/tweets/search?q=a+b&limit=20");
  });

  test("sends a JSON body with the given method", async () => {
    const sent = stubFetch(200, { id: "1" });
    await request(idSchema, "/monitors/42", { method: "PATCH", body: { isActive: false } });
    expect(sent[0].init?.method).toBe("PATCH");
    expect(sent[0].init?.body).toBe('{"isActive":false}');
    expect((sent[0].init?.headers as Record<string, string>)["content-type"]).toBe("application/json");
  });

  const statuses = [
    [400, "invalid"],
    [401, "auth"],
    [402, "credits"],
    [403, "paused"],
    [404, "notFound"],
    [409, "upstream"],
    [410, "upstream"],
    [424, "upstream"],
    [429, "rateLimited"],
    [500, "upstream"],
    [502, "upstream"],
    [503, "upstream"],
  ] as const;

  for (const [status, kind] of statuses) {
    test(`maps ${status} to ${kind} and shows the server message`, async () => {
      stubFetch(status, { error: "some_code", message: "From the server." });
      const error = await failure(request(idSchema, "/x"));
      expect(error.kind).toBe(kind);
      expect(describeError(error).hint).toBe("From the server.");
    });
  }

  test("falls back to the table hint when the error body has no message", async () => {
    stubFetch(401, "not json");
    const error = await failure(request(idSchema, "/x"));
    expect(describeError(error)).toEqual({
      title: "Invalid API Key",
      hint: "Check the key in the extension preferences.",
      fix: "preferences",
    });
  });

  test("reports a thrown fetch as network", async () => {
    globalThis.fetch = (async () => {
      throw new TypeError("fetch failed");
    }) as unknown as typeof fetch;
    expect((await failure(request(idSchema, "/x"))).kind).toBe("network");
  });

  test("reports a schema mismatch as unexpected", async () => {
    stubFetch(200, { id: 1 });
    expect((await failure(request(idSchema, "/x"))).kind).toBe("unexpected");
  });

  test("reports a 200 that is not JSON as unexpected", async () => {
    stubFetch(200, "<html>");
    expect((await failure(request(idSchema, "/x"))).kind).toBe("unexpected");
  });
});

describe("fetchFile", () => {
  test("reads the bytes without the API key", async () => {
    const sent = stubFetch(200, "abc");
    expect(new TextDecoder().decode(await fetchFile("https://media.xquik.com/tweet_1/0.jpg"))).toBe("abc");
    expect(sent[0].init).toBeUndefined();
  });

  test("maps a failed status", async () => {
    stubFetch(404, "");
    expect((await failure(fetchFile("https://media.xquik.com/tweet_1/0.jpg"))).kind).toBe("notFound");
  });
});

describe("describeError", () => {
  test("treats a foreign error as unexpected", () => {
    expect(describeError(new Error("boom")).title).toBe("Unexpected Response");
  });
});
