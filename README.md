# Raycast X (Twitter) Extension to Search Tweets by Xquik

[![Framer builds a tweet ticker with Xquik](https://img.youtube.com/vi/4UOSpoOoC3Y/maxresdefault.jpg)](https://youtu.be/4UOSpoOoC3Y?t=367)\
[Watch Framer build a tweet ticker with Xquik, from 6:07](https://youtu.be/4UOSpoOoC3Y?t=367).
This Raycast extension calls the Xquik API.

Use this Raycast X (Twitter) extension by Xquik to search tweets, profiles & trends.
`Search Posts` takes X (Twitter) search operators and finds public tweets of any date.

Xquik is the world's fastest and cheapest X (Twitter) scraper service with the most complete X (Twitter) data.
Most other Apify Actors charge before filtering or deduplication.
Xquik charges only for delivered, unique, filter-matching results and never pads rows.
Xquik is independent and not affiliated with X Corp.

<!-- trust:win:start -->

The Xquik REST API read 45 tweets per second on 2026-10-15. That cost $0.15 per 1,000. The fastest of 4 rival Actors read 12.5 per second. The cheapest cost $0.173 per 1,000. [Compare each run](https://xquik.com/benchmarks#benchmark-x-tweet-scraper).

<!-- trust:win:end -->

## Install the Raycast X (Twitter) extension

The extension isn't in the Raycast Store yet.
Run it from its source in Raycast's developer mode.
It needs Raycast & Node.js 22.14 or newer.

```sh
git clone https://github.com/Xquik-dev/xquik-raycast.git
cd xquik-raycast
npm install && npm run dev
```

## Set up

1. Sign up at [xquik.com](https://xquik.com) with your email. You need no password.
2. Add credits or choose a plan in your Xquik dashboard.
3. Open [API Keys](https://dashboard.xquik.com/en/account?tab=api-keys) & create a key. Copy it right away.
4. Open any Xquik command & paste the key into **Xquik API Key**.

Raycast keeps the key in its encrypted local store.
The extension sends it only to xquik.com.

## Run a tweet search with X (Twitter) search operators

Open `Search Posts`, type a query like this one & press Enter.

```text
"twitter api" min_faves:10 since:2026-10-01
```

Next, read the [command list](#commands), the [X (Twitter) search operators](https://github.com/Xquik-dev/x-twitter-advanced-search) or the [credit prices](#prices).

<!-- trust:start -->

## Benchmarks & usage

[![X (Twitter) API p99 server read time](https://img.shields.io/endpoint?url=https%3A%2F%2Fxquik.com%2Fbadges%2Frest-p99.json)](https://xquik.com/benchmarks#speed)
[![X (Twitter) API package downloads](https://img.shields.io/endpoint?url=https%3A%2F%2Fxquik.com%2Fbadges%2Fdownloads.json)](https://xquik.com/benchmarks#downloads)

- 4.9 s p99 REST server read time over 7 days, failures included ([source](https://xquik.com/benchmarks#speed)) <!-- trust:rest-p99 4871 -->
- 64,000+ downloads of Xquik's X (Twitter) API packages across 6 registries ([source](https://xquik.com/benchmarks#downloads)) <!-- trust:downloads 64497 -->

Checked on 2026-11-09. See each number with its date & source on [xquik.com/benchmarks](https://xquik.com/benchmarks) or as [JSON](https://xquik.com/trust.json).

<!-- trust:end -->

## Commands

- `Search Posts` finds public tweets of any date. Press Enter to run a search, so typing costs nothing.
- `Advanced Search` filters posts by author, mention, language, dates, likes, reposts & media.
- `Search Users` finds accounts by name or username.
- `Get User Profile` shows an account's counts, bio, links & contact details.
- `Get User Posts` lists an account's latest posts, newest first.
- `Get User Mentions` lists public tweets that mention an account.
- `Get Post` opens 1 post from its link or ID.
- `Get Post Replies` lists the replies to a post.
- `Download Post Media` saves a post's photos & videos to your Downloads folder.
- `Check Follow` shows whether 2 accounts follow each other.
- `View Trends` lists what's trending in 16 places.
- `Manage Monitors` creates, pauses & deletes account and keyword monitors.
- `View Monitor Events` lists the latest posts & changes your monitors found.
- `Monitor Events in Menu Bar` shows your monitors' new events. It checks every 10 minutes.

Each post opens in a detail view.
From there you can open the post on X (Twitter) or open its author.
You can read its replies, thread & quotes.
You can copy its text or link, and save its media.

Commands take a username, an @username or a profile link.
Post commands take a post link or ID.
Copy a post link on X (Twitter), and post commands open it.

Root search finds each command by words like tweet, twitter, trends or followers.
Set `Search Posts` as a fallback command to search what you typed.

`Search Posts` & `Search Users` list your recent searches.
Press ⌘ ⇧ S on a search to save it as a Quicklink.
The Quicklink runs straight from root search.

## Raycast AI

Mention Xquik in Raycast AI to ask about X (Twitter) data in plain words.
Its 15 tools search tweets & users, read profiles, replies & threads.
They also save tweet media, check follows, read trends & manage monitors.
Raycast asks you to confirm before a tool creates or deletes a monitor.

## Prices

- Posts, profiles & replies cost 1 credit each.
- A pay-as-you-go credit costs $0.00015.
- [Monthly plans](https://xquik.com) cost up to 20% less.
- A trends list costs 1 credit.
- An active monitor costs 30 credits an hour, events included.

You pay only for the rows you get.

## Limits

- Reads return public data only.
- A protected account's posts stay private.

## Questions

### Do I need an X (Twitter) developer account?

No. Public reads need only an Xquik API key.
Private reads & account actions need a connected X (Twitter) account.

### Is this the official X (Twitter) API?

No. Xquik runs its own REST API.
The extension calls that API, not the official X (Twitter) API.

## Support

Email support@xquik.com or read the docs at [docs.xquik.com](https://docs.xquik.com).

## More Xquik tools

- [X (Twitter) scraper API & MCP server](https://github.com/Xquik-dev/x-twitter-scraper) with REST, MCP & Skill setup.
- X (Twitter) API SDKs for [TypeScript](https://github.com/Xquik-dev/x-twitter-scraper-typescript), [Python](https://github.com/Xquik-dev/x-twitter-scraper-python), [Go](https://github.com/Xquik-dev/x-twitter-scraper-go), [Ruby](https://github.com/Xquik-dev/x-twitter-scraper-ruby), [Java](https://github.com/Xquik-dev/x-twitter-scraper-java), [Kotlin](https://github.com/Xquik-dev/x-twitter-scraper-kotlin), [C#](https://github.com/Xquik-dev/x-twitter-scraper-csharp) & [PHP](https://github.com/Xquik-dev/x-twitter-scraper-php).
- [X (Twitter) CLI](https://github.com/Xquik-dev/x-twitter-scraper-cli) for terminal workflows.
- The [X (Twitter) API alternative skill](https://github.com/Xquik-dev/x-api) & [X (Twitter) advanced search operators](https://github.com/Xquik-dev/x-twitter-advanced-search).
- X (Twitter) agent plugins for [OpenClaw](https://github.com/Xquik-dev/tweetclaw) & [Hermes Agent](https://github.com/Xquik-dev/hermes-tweet).
- The [X (Twitter) API documentation source](https://github.com/Xquik-dev/xquik-docs).
- X (Twitter) integrations for [n8n](https://github.com/Xquik-dev/n8n-nodes-xquik), [Prefect](https://github.com/Xquik-dev/prefect-xquik), [Haystack](https://github.com/Xquik-dev/xquik-haystack), [Paperclip](https://github.com/Xquik-dev/paperclip-plugin-xquik), [Terraform](https://github.com/Xquik-dev/terraform-provider-x-twitter-scraper), [Convex](https://github.com/Xquik-dev/xquik-convex), [Supabase](https://github.com/Xquik-dev/xquik-supabase) & [Strapi](https://github.com/Xquik-dev/strapi-plugin-xquik).
- X (Twitter) MCP for [AI agents](https://github.com/Xquik-dev/xquik-mcp) & [VS Code](https://github.com/Xquik-dev/xquik-vscode).
- [Xquik X (Twitter) API & scraper](https://xquik.com) and the [X (Twitter) API documentation](https://docs.xquik.com/api-reference/overview).

Xquik is an independent third-party service. Not affiliated with X Corp. "Twitter" and "X" are trademarks of X Corp.
