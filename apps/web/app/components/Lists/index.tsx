import Alert from "~/components/Alert";
import { LoadingScreen } from "~/components/Loading";
import { memo, useMemo } from "react";

import type { List, User } from "app/lib/types";
import ListItem from "./list-item";

const NoResults = () => {
	return (
		<div className="flex flex-col items-center justify-center text-center py-6">
			<p className="text-gray-400">
				Your lists will appear here once you create them.
			</p>
			<p className="text-gray-400"> Start saving your favorite places!</p>
		</div>
	);
};

function Lists({
	status,
	lists,
	error,
	currentUserEmail,
}: {
	status: string;
	lists: (List & { createdBy: User })[];
	error: any;
	currentUserEmail: string;
}) {
	if (status === "loading") {
		return <LoadingScreen />;
	}

	if (error) {
		return <Alert type="error">{error.message}</Alert>;
	}

	if (lists?.length === 0) {
		return <NoResults />;
	}

	if (!lists) {
		return null;
	}

	// Memoize the ownership calculation to prevent recalculations on re-render
	const listsWithOwnership = useMemo(() => {
		return lists.map((list) => ({
			...list,
			isOwnList: list.createdBy.email === currentUserEmail
		}));
	}, [lists, currentUserEmail]);

	return (
		<ul data-testid="lists" className="space-y-2">
			{listsWithOwnership.map((list) => (
				<ListItem
					key={list.id}
					list={list}
					isOwnList={list.isOwnList}
				/>
			))}
		</ul>
	);
}

// Export a memoized version of the component
export default memo(Lists);
