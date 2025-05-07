import Loading from "app/components/Loading";

import api from "app/lib/api";
import { useLoaderData } from "react-router";
import BookmarkForm from "~/components/bookmarks/bookmark-form";
import BookmarkListItem from "~/components/bookmarks/bookmark-list-item";

export async function loader() {
	try {
		const response = await api.get("/bookmarks");
		return { bookmarks: response.data };
	} catch (error) {
		console.error("Failed to fetch bookmarks:", error);
		throw new Response("Could not load bookmarks.", { status: 500 });
	}
}

const Bookmarks = () => {
	const { bookmarks: data } = useLoaderData() as { bookmarks: any[] };
	const refetch = async () => {
		// This will trigger a re-render with the client loader
		window.location.reload();
	};

	return (
		<>
			<BookmarkForm onCreate={refetch} />
			<div>
				{!data && <Loading />}
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

export default Bookmarks;

export function ErrorBoundary({ error }: { error: unknown }) {
	console.error(error);
	return <div>An unexpected error occurred while loading bookmarks.</div>;
}
