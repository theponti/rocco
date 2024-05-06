import LoadingScene from "@hominem/components/Loading";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";

import BookmarkForm from "src/components/BookmarkForm";
import BookmarkListItem from "src/components/BookmarkListItem";
import { useGetBookmarks } from "src/services/api/bookmarks";
import { useAuth } from "src/services/auth";

const Recommendations = () => {
	const navigate = useNavigate();
	const { user } = useAuth();
	const { data, refetch, status: bookmarksStatus } = useGetBookmarks();

	if (!user) {
		navigate({ to: "/" });
	} else {
		refetch();
	}

	return (
		<>
			<BookmarkForm onCreate={refetch} />
			<div>
				{bookmarksStatus === "loading" && <LoadingScene />}
				{data?.length === 0 && "your bookmarks will appear here"}
				{data && data.length > 0 && (
					<ul className="space-y-2">
						{data.map((bookmark) => (
							<BookmarkListItem
								key={bookmark.id}
								bookmark={bookmark}
								onDelete={refetch}
							/>
						))}
					</ul>
				)}
			</div>
		</>
	);
};

export const Route = createLazyFileRoute("/bookmarks/")({
	component: Recommendations,
});
