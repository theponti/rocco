import { PlusCircle } from "lucide-react";
import { memo } from "react";
import { Link } from "react-router";

import Alert from "~/components/alert";
import type { List } from "~/lib/types";
import ListItem from "./list-item";
import styles from "./lists.module.css";

const NoResults = () => {
	return (
		<div className={styles.emptyStateCard}>
			<div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6">
				<PlusCircle size={30} className="text-indigo-400" />
			</div>
			<h3 className="text-xl font-semibold mb-3 text-white">No Lists Yet</h3>
			<p className="text-white/60 max-w-md mb-6">
				Create your first list to start organizing your favorite places and plan
				your next adventures!
			</p>
			<Link
				to="/lists/new"
				className={`${styles.createButton} flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-medium`}
				data-testid="create-list-cta"
			>
				Create your first list
			</Link>
		</div>
	);
};

const skeletonArray = Array.from({ length: 3 }, () => crypto.randomUUID());
function Lists({
	status,
	lists,
	error,
	currentUserEmail,
}: {
	status: string;
	lists: List[];
	error: any;
	currentUserEmail: string;
}) {
	if (status === "loading") {
		return (
			<div className="space-y-3" data-testid="lists-skeleton">
				{skeletonArray.map((_) => (
					<li key={_} className={styles.skeletonLoader} />
				))}
			</div>
		);
	}

	if (error) {
		return (
			<Alert type="error">
				<div className="flex flex-col gap-2">
					<p className="font-medium">{error.message}</p>
					<button
						type="button"
						className="self-start px-4 py-1.5 bg-white/10 hover:bg-white/15 text-white text-sm font-medium rounded-lg transition-colors"
						onClick={() => window.location.reload()}
						data-testid="lists-retry-btn"
					>
						Retry
					</button>
				</div>
			</Alert>
		);
	}

	if (lists?.length === 0) {
		return <NoResults />;
	}

	if (!lists) {
		return null;
	}

	return (
		<ul data-testid="lists" className="space-y-3">
			{lists.map((list) => (
				<ListItem
					key={list.id}
					list={list}
					isOwnList={list.isOwnList}
					aria-label={
						list.isOwnList ? `Your list: ${list.name}` : `List: ${list.name}`
					}
				/>
			))}
		</ul>
	);
}

// Export a memoized version of the component
export default memo(Lists);
