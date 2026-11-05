# Raycast Twitter Extension for X Search by Xquik

[![Convex Component](https://www.convex.dev/components/badge/convex-xquik)](https://www.convex.dev/components/convex-xquik)

Search X (Twitter) data from Raycast with your Xquik API key.

Xquik is the world's fastest and cheapest X Twitter data API with the most complete X data. Most other Twitter APIs charge per request, even for empty pages & errors. Xquik charges only for delivered, unique, filter-matching results and never pads rows.

Xquik is an independent third-party service. Not affiliated with X Corp. "Twitter" and "X" are trademarks of X Corp.

## Install the Raycast Twitter extension

Run the extension from its source in Raycast's developer mode. It needs Node.js & Raycast.

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

Raycast keeps the key in its encrypted local store. The extension sends it only to xquik.com.

## Commands

- **Search Posts** finds public posts of any date. Press Enter to run a search, so typing costs nothing. It takes [X search operators](https://github.com/Xquik-dev/x-twitter-advanced-search) such as `from:` & `since:`.
- **Advanced Search** filters posts by author, mention, language, dates, likes, reposts & media.
- **Search Users** finds accounts by name or username.
- **Get User Profile** shows an account's counts, bio, links & contact details.
- **Get User Posts** lists an account's latest posts, newest first.
- **Get User Mentions** lists public posts that mention an account.
- **Get Post** opens 1 post from its link or ID.
- **Get Post Replies** lists the replies to a post.
- **Download Post Media** saves a post's photos & videos to your Downloads folder.
- **Check Follow** shows whether 2 accounts follow each other.
- **View Trends** lists what's trending in 16 places.
- **Manage Monitors** creates, pauses & deletes account and keyword monitors.
- **View Monitor Events** lists the latest posts & changes your monitors found.
- **Monitor Events in Menu Bar** shows how many new events your monitors found, and checks every 10 minutes.

Each post opens in a detail view. From there you can open it on X, read its replies, thread & quotes, open its author, copy its text or link, and save its media.

Commands take a username, an @username or a profile link. Post commands take a post link or ID. Copy a post link on X, and the post commands open it with no typing.

Root search finds each command by words like tweet, twitter, trends or followers. Set Search Posts as a fallback command to search X for whatever you typed.

Search Posts & Search Users list your recent searches. Press ⌘ ⇧ S on a search to save it as a Quicklink, so it runs straight from root search.

## Run a tweet search with Twitter search operators

Search Posts takes X search operators. Type a query like this one.

```text
"twitter api" min_faves:10 since:2026-10-01
```

<!-- trust:start -->

## Trust & usage

[![Twitter API package downloads](https://img.shields.io/endpoint?url=https%3A%2F%2Fxquik.com%2Fbadges%2Fdownloads.json)](https://xquik.com/trust#downloads)
[![Twitter scraper users on Apify](https://img.shields.io/endpoint?url=https%3A%2F%2Fxquik.com%2Fbadges%2Fapify-users.json)](https://apify.com/xquik)
[![Twitter scraper runs on Apify](https://img.shields.io/endpoint?url=https%3A%2F%2Fxquik.com%2Fbadges%2Fapify-runs.json)](https://apify.com/xquik)
[![Tweet scraper rating on Apify](https://img.shields.io/endpoint?url=https%3A%2F%2Fxquik.com%2Fbadges%2Fapify-rating.json)](https://apify.com/xquik/x-tweet-scraper/reviews)
[![Xquik Twitter API accounts](https://img.shields.io/endpoint?url=https%3A%2F%2Fxquik.com%2Fbadges%2Faccounts.json)](https://xquik.com/trust#accounts)
[![Twitter Skill installs](https://img.shields.io/endpoint?url=https%3A%2F%2Fxquik.com%2Fbadges%2Fskill-installs.json)](https://xquik.com/trust#skill-installs)
[![Xquik verified revenue on TrustMRR](https://img.shields.io/endpoint?url=https%3A%2F%2Fxquik.com%2Fbadges%2Frevenue.json)](https://trustmrr.com/startup/xquik)
[![Twitter API p99 server read time](https://img.shields.io/endpoint?url=https%3A%2F%2Fxquik.com%2Fbadges%2Frest-p99.json)](https://xquik.com/trust#speed)
[![Xquik GitHub stars](https://img.shields.io/endpoint?url=https%3A%2F%2Fxquik.com%2Fbadges%2Fgithub-stars.json)](https://github.com/Xquik-dev)

- 54,000+ downloads of Xquik's Twitter API packages on npm, PyPI, RubyGems, NuGet, Packagist & Terraform ([source](https://xquik.com/trust#downloads)) <!-- trust:downloads 54576 -->
- 10,000+ users of Xquik's Twitter scraper Actors on Apify ([source](https://apify.com/xquik)) <!-- trust:apify-users 10119 -->
- 7,000,000+ runs of Xquik's Twitter scraper Actors on Apify ([source](https://apify.com/xquik)) <!-- trust:apify-runs 7076266 -->
- 4.66 of 5 for the X Tweet Scraper from 16 Apify reviews ([source](https://apify.com/xquik/x-tweet-scraper/reviews)) <!-- trust:apify-rating 4.66 16 -->
- 4,100+ accounts on xquik.com ([source](https://xquik.com/trust#accounts)) <!-- trust:accounts 4126 -->
- 1,600+ installs of Xquik's Twitter Skills on skills.sh ([source](https://xquik.com/trust#skill-installs)) <!-- trust:skill-installs 1619 -->
- $40,000+ in revenue verified by TrustMRR ([source](https://trustmrr.com/startup/xquik)) <!-- trust:revenue 40329 -->
- 13.8 s p99 REST API server read time over 7 days, failed reads included ([source](https://xquik.com/trust#speed)) <!-- trust:rest-p99 13778 -->
- 380+ GitHub stars across Xquik's repos ([source](https://github.com/Xquik-dev)) <!-- trust:github-stars 386 -->

Checked on 2026-10-28. See each number with its date & source on [xquik.com/trust](https://xquik.com/trust) or as [JSON](https://xquik.com/trust.json).

<!-- trust:end -->

## Raycast AI

Mention Xquik in Raycast AI to ask about X (Twitter) data in plain words. Its 15 tools search posts & users, read profiles, posts, replies & threads, save post media, check follows, read trends and manage monitors. Raycast asks you to confirm before a tool creates or deletes a monitor.

## Prices

- Posts, profiles & replies cost 1 credit each, from $0.00015.
- A trends list costs 1 credit.
- An active monitor costs 30 credits an hour, events included.

You pay only for the rows you get. Read the plans at [xquik.com](https://xquik.com).

## Limits

- Reads return public data only.
- A protected account's posts stay private.

## Questions

### Do I need an X developer account?

No. Public reads need only an Xquik API key. Private reads & X account actions
need a connected X account.

### Is this the official X API?

No. Xquik is an independent third-party service with its own REST API. The extension
calls that API, not the official X API.

## Support

Email support@xquik.com or read the docs at [docs.xquik.com](https://docs.xquik.com).

## More Xquik tools

- [X (Twitter) scraper API & Twitter MCP server](https://github.com/Xquik-dev/x-twitter-scraper) with REST, MCP & Skill setup.
- Twitter API SDKs for [TypeScript](https://github.com/Xquik-dev/x-twitter-scraper-typescript), [Python](https://github.com/Xquik-dev/x-twitter-scraper-python), [Go](https://github.com/Xquik-dev/x-twitter-scraper-go), [Ruby](https://github.com/Xquik-dev/x-twitter-scraper-ruby), [Java](https://github.com/Xquik-dev/x-twitter-scraper-java), [Kotlin](https://github.com/Xquik-dev/x-twitter-scraper-kotlin), [C#](https://github.com/Xquik-dev/x-twitter-scraper-csharp) & [PHP](https://github.com/Xquik-dev/x-twitter-scraper-php).
- [Twitter CLI & X CLI](https://github.com/Xquik-dev/x-twitter-scraper-cli), the [X API alternative skill](https://github.com/Xquik-dev/x-api) and [Twitter advanced search operators](https://github.com/Xquik-dev/x-twitter-advanced-search) with tested examples.
- Twitter agent plugins for [OpenClaw](https://github.com/Xquik-dev/tweetclaw) & [Hermes Agent](https://github.com/Xquik-dev/hermes-tweet), and the [Twitter API documentation source](https://github.com/Xquik-dev/xquik-docs).
- Twitter integrations for [n8n](https://github.com/Xquik-dev/n8n-nodes-xquik), [Prefect](https://github.com/Xquik-dev/prefect-xquik), [Haystack](https://github.com/Xquik-dev/xquik-haystack), [Paperclip](https://github.com/Xquik-dev/paperclip-plugin-xquik), [Terraform](https://github.com/Xquik-dev/terraform-provider-x-twitter-scraper), [Convex](https://github.com/Xquik-dev/xquik-convex), [Supabase](https://github.com/Xquik-dev/xquik-supabase) & [Strapi](https://github.com/Xquik-dev/strapi-plugin-xquik).
- Twitter MCP for [AI agents](https://github.com/Xquik-dev/xquik-mcp), [VS Code](https://github.com/Xquik-dev/xquik-vscode) & [Raycast](https://github.com/Xquik-dev/xquik-raycast).
- [Xquik X API & Twitter scraper](https://xquik.com) and the [Twitter API documentation](https://docs.xquik.com/api-reference/overview).
