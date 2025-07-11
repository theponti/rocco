import { Plus } from "lucide-react";
import { Link } from "react-router";
import type { List } from "~/lib/types";
import styles from "./lists.module.css";

interface ListsProps {
	lists: List[];
	status: "success" | "error" | "loading";
	error: string | null;
}

export default function Lists({ lists, status, error }: ListsProps) {
	if (status === "loading") {
		return (
			<div className="flex items-center justify-center h-32">
				<div className="loading loading-spinner loading-lg" />
			</div>
		);
	}

	if (status === "error") {
		return (
			<div className="text-center py-8">
				<p className="text-red-600">Error loading lists: {error}</p>
			</div>
		);
	}

	if (lists.length === 0) {
		return (
			<div className="text-center py-8">
				<h3 className="text-xl font-semibold mb-3 text-gray-900">No Lists Yet</h3>
				<p className="text-gray-600 max-w-md mb-6">
					Create your first list to start organizing places you love or want to visit.
				</p>
				<Link
					to="/lists/create"
					className={`${styles.createButton} flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-medium`}
				>
					<Plus size={16} />
					Create List
				</Link>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-bold text-gray-900">Your Lists</h2>
				<Link
					to="/lists/create"
					className="self-start px-4 py-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-sm font-medium rounded-lg transition-colors"
				>
					<Plus size={16} className="inline mr-1" />
					New List
				</Link>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{lists.map((list) => (
					<Link
						key={list.id}
						to={`/lists/${list.id}`}
						className="block p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200"
					>
						<div className="flex items-center justify-between mb-3">
							<h3 className="text-lg font-semibold text-gray-900 truncate">
								{list.name}
							</h3>
						</div>
						<p className="text-gray-600 text-sm mb-4">
							{list.itemCount} {list.itemCount === 1 ? "place" : "places"}
						</p>
						<div className="flex items-center justify-between">
							<span className="text-xs text-gray-500">
								{list.isPublic ? "Public" : "Private"}
							</span>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}
