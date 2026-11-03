import { LaunchProps, List } from "@raycast/api";
import { useState } from "react";
import { PostFeedList } from "./components/post-feed-list";
import { useSubmittedSearch } from "./components/submitted-search";
import { SearchSort } from "./lib/feeds";

const SORTS: SearchSort[] = ["Latest", "Top", "Photos", "Videos"];

export default function Command({ arguments: { query } }: LaunchProps<{ arguments: Arguments.SearchPosts }>) {
  const search = useSubmittedSearch(query);
  const [sort, setSort] = useState<SearchSort>("Latest");
  return (
    <PostFeedList
      feed={{ kind: "search", query: search.submitted, sort, filters: {} }}
      search={search}
      searchBarAccessory={
        <List.Dropdown tooltip="Sort" value={sort} onChange={(value) => setSort(value as SearchSort)}>
          {SORTS.map((option) => (
            <List.Dropdown.Item key={option} title={option} value={option} />
          ))}
        </List.Dropdown>
      }
    />
  );
}
