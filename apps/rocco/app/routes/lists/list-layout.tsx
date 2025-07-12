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
import { trpc } from "~/lib/trpc/client";
import type { List } from "~/lib/types";

// Types for the loader data
type LoaderData = {
	list: List;
};

// Loader function to fetch shared list data for all nested routes
export async function loader({ params }: { params: { id: string } }) {
	// For now, return empty data and let the client fetch with tRPC
	return { list: null };
}

/**
 * Layout component for list-specific routes
 * Provides common UI elements and context for all routes under a specific list
 */
export default function ListLayout() {
	const params = useParams<{ id: string }>();
	const { data: list, isLoading } = trpc.lists.getById.useQuery({ 
		id: params.id || "" 
	});

	if (isLoading) {
		return <LoadingScreen />;
	}

	if (!list) {
		return <Alert type="error">List not found</Alert>;
	}

	return (
		<div className="container mx-auto px-4 md:px-0">
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
							`px-4 py-2 ${isActive ? "border-b-2 border-blue-500 font-medium text-primary" : "text-gray-500"}`
						}
						end
					>
						Places
					</NavLink>
					<NavLink
						to={`/lists/${params.id}/invites`}
						className={({ isActive }) =>
							`px-4 py-2 ${isActive ? "border-b-2 border-blue-500 font-medium text-primary" : "text-gray-500"}`
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
