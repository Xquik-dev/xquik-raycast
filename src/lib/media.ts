import { mkdir, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { extname, join } from "node:path";
import { fetchFile, request } from "./api";
import { mediaDownloadSchema, SavedMedia } from "./schemas";

const FALLBACK_EXTENSIONS: Record<string, string> = { photo: "jpg", video: "mp4", animated_gif: "mp4" };
const EXTENSION = /^[a-z0-9]{1,8}$/i;

export function mediaFileName({ mediaUrl, mediaType, tweetId }: SavedMedia, index: number): string {
  const extension = extname(new URL(mediaUrl).pathname).slice(1);
  return `xquik-${tweetId}-${index}.${EXTENSION.test(extension) ? extension : FALLBACK_EXTENSIONS[mediaType]}`;
}

export async function saveMedia(post: string, folder = join(homedir(), "Downloads")): Promise<string[]> {
  const { items } = await request(mediaDownloadSchema, "/x/media/download", {
    method: "POST",
    body: { tweetInput: post },
  });
  await mkdir(folder, { recursive: true });
  return Promise.all(
    items.map(async (item, index) => {
      const path = join(folder, mediaFileName(item, index));
      // codeql[js/http-to-file-access] Saving the post's media is what the command does. savedMediaSchema keeps the post ID to digits and mediaFileName keeps the extension plain, so the file stays in the chosen folder.
      await writeFile(path, await fetchFile(item.mediaUrl));
      return path;
    }),
  );
}
