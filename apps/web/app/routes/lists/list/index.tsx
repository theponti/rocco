import { useAuth } from "@clerk/react-router";
import ListMenu from "app/components/Lists/list-menu";
import { PlusCircle, Share } from "lucide-react";
import { useCallback, useState } from "react";
import { Link, href, redirect, useLoaderData, useNavigate } from "react-router";
import Alert from "~/components/Alert";
import ErrorBoundary from "~/components/ErrorBoundary";
import { LoadingScreen } from "~/components/Loading";
import PlaceItem from "~/components/PlaceItem";
import PlacesAutocomplete from "~/components/PlacesAutocomplete";
import { useGeolocation } from "~/hooks/useGeolocation";
import { type GetListResponse, getList } from "~/lib/api";
import { handleLoaderData } from "~/lib/loaders";
import type { SearchPlace } from "~/lib/types";
import type { Route } from "./+types";

export const clientLoader = async ({ params }: Route.ClientLoaderArgs) => {
	if (!params.id) {
		return redirect("/404");
	}

	const list = await handleLoaderData(
		getList(params.id),
		"Failed to load list",
	);

	// Redirect if list doesn't exist
	if (!list) {
		return redirect("/404");
	}

	return { list };
};

export function HydrateFallback() {
	return <LoadingScreen />;
}

export default function ListPage() {
	const { userId } = useAuth();
	const { currentLocation } = useGeolocation();
	const navigate = useNavigate();
	const [deleteError, setDeleteError] = useState<string | null>(null);
	const { list: data } = useLoaderData<{ list: GetListResponse }>();
	const [isAddToListOpen, setIsAddToListOpen] = useState(false);

	const refetch = useCallback(async () => {
		// This will re-run the clientLoader
		window.location.reload();
	}, []);

	const onSelectedChanged = useCallback(
		(place: SearchPlace) =>
			navigate(href("/places/:id", { id: place.googleMapsId })),
		[navigate],
	);

	const handleDeleteError = () => {
		setDeleteError("Could not delete place. Please try again.");
	};

	if (!data) {
		return <Alert type="error">We could not find this list.</Alert>;
	}

	if (deleteError) {
		return <Alert type="error">{deleteError}</Alert>;
	}

	return (
		<div className="flex flex-col px-0.5 w-full">
			{data && (
				<div className="flex flex-col px-0.5">
					<div className="flex justify-between items-center mb-6">
						<h1 className="text-3xl font-semibold">{data.name}</h1>
						<div className="flex gap-4">
							{/* Only list owners can invite others. */}
							{data.userId === userId && !isAddToListOpen && (
								<button
									type="button"
									data-testid="add-to-list-button"
									onClick={() => setIsAddToListOpen(!isAddToListOpen)}
									className="flex gap-2 text-black hover:bg-opacity-80 focus:bg-opacity-80 cursor-pointer"
								>
									<PlusCircle />
								</button>
							)}
							{/* Only list owners can share with others. */}
							{data.userId === userId && (
								<Link
									to={`/lists/${data.id}/invites`}
									className="flex gap-2 text-black hover:bg-opacity-80 focus:bg-opacity-80"
								>
									<span className="hover:cursor-pointer">
										<Share />
									</span>
								</Link>
							)}
							<ListMenu list={data} isOwnList={data.userId === userId} />
						</div>
					</div>
					{(data?.items?.length === 0 || isAddToListOpen) && (
						<div
							data-testid="add-to-list"
							className="mb-6 bg-slate-100 rounded-lg p-4 pb-8"
						>
							<label className="label font-semibold" htmlFor="search">
								Add a place
							</label>
							<PlacesAutocomplete
								setSelected={onSelectedChanged}
								center={currentLocation}
							/>
						</div>
					)}
					{data.items.length === 0 && (
						<Alert type="info">
							This list is empty. Start adding places with the search bar above.
						</Alert>
					)}
					<div className="grid gap-x-6 gap-y-14 grid-cols-2 sm:grid-cols-3">
						{data.items.map((place) => (
							<PlaceItem
								key={place.id}
								onError={handleDeleteError}
								onDelete={refetch}
								place={place}
								listId={data.id}
							/>
						))}
					</div>
				</div>
			)}
		</div>
	);
}

export { ErrorBoundary };
