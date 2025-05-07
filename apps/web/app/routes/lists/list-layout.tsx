import { Suspense } from "react";
import {
	NavLink,
	Outlet,
	redirect,
	useLoaderData,
	useParams,
} from "react-router";
import Alert from "~/components/alert";
import { LoadingScreen } from "~/components/loading";
import { api } from "~/lib/api/base";
import type { List } from "~/lib/types";

// Types for the loader data
type LoaderData = {
	list: List;
};

// Loader function to fetch shared list data for all nested routes
export async function loader({ params }: { params: { id: string } }) {
	// Auth check should be done in each child route
	try {
		const response = await api.get(`/lists/${params.id}`);
		return { list: response.data };
	} catch (error) {
		// Handle errors like 404s or unauthorized
		console.error("Error loading list:", error);
		throw redirect("/lists");
	}
}

/**
 * Layout component for list-specific routes
 * Provides common UI elements and context for all routes under a specific list
 */
export default function ListLayout() {
	const { list } = useLoaderData() as LoaderData;
	const params = useParams<{ id: string }>();

	if (!list) {
		return <Alert type="error">List not found</Alert>;
	}

	return (
		<div className="w-full">
			{/* List header with navigation */}
			<div className="mb-6">
				<div className="flex items-center justify-between mb-4">
					<h1 className="text-2xl font-bold">{list.name}</h1>
				</div>

				{/* Navigation tabs for list sections */}
				<div className="flex border-b mb-4">
					<NavLink
						to={`/lists/${params.id}`}
						className={({ isActive }) =>
							`px-4 py-2 ${isActive ? "border-b-2 border-blue-500 font-medium" : "text-gray-500"}`
						}
						end
					>
						Places
					</NavLink>
					<NavLink
						to={`/lists/${params.id}/invites`}
						className={({ isActive }) =>
							`px-4 py-2 ${isActive ? "border-b-2 border-blue-500 font-medium" : "text-gray-500"}`
						}
					>
						Collaborators
					</NavLink>
				</div>
			</div>

			{/* Nested route content */}
			<Suspense fallback={<LoadingScreen />}>
				<Outlet context={{ list }} />
			</Suspense>
		</div>
	);
}
