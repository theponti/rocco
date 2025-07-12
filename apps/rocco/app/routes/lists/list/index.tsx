import { PlusCircle, Share } from "lucide-react";
import { useCallback, useState } from "react";
import {
	Link,
	href,
	redirect,
	useLoaderData,
	useNavigate,
	useParams,
} from "react-router";
import { useAuth } from "~/lib/auth-provider";

import ErrorBoundary from "~/components/ErrorBoundary";
import Alert from "~/components/alert";
import ListMenu from "~/components/lists-components/list-menu";
import { LoadingScreen } from "~/components/loading";
import PlaceItem from "~/components/places/place-item";
import PlacesAutocomplete from "~/components/places/places-autocomplete";
import { useGeolocation } from "~/hooks/useGeolocation";
import type { GooglePlacePrediction } from "~/hooks/useGooglePlacesAutocomplete";
import { handleLoaderData } from "~/lib/loaders";
import { trpc } from "~/lib/trpc/client";
import type { Route } from "./+types";

export const clientLoader = async ({ params }: Route.ClientLoaderArgs) => {
	if (!params.id) {
		return redirect("/404");
	}

	// For now, return empty data and let the client fetch with tRPC
	return { list: null };
};

export function HydrateFallback() {
	return <LoadingScreen />;
}

export default function ListPage() {
	const { user } = useAuth();
	const { currentLocation } = useGeolocation();
	const navigate = useNavigate();
	const [deleteError, setDeleteError] = useState<string | null>(null);
	const params = useParams<{ id: string }>();
	const { data: listData, isLoading } = trpc.lists.getById.useQuery({
		id: params.id || "",
	});
	const data = listData ? { ...listData, places: [] } : null;
	const [isAddToListOpen, setIsAddToListOpen] = useState(false);

	const refetch = useCallback(async () => {
		// This will re-run the clientLoader
		window.location.reload();
	}, []);

	const onSelectedChanged = useCallback(
		(place: GooglePlacePrediction) =>
			navigate(href("/places/:id", { id: place.place_id })),
		[navigate],
	);

	const handleDeleteError = () => {
		setDeleteError("Could not delete place. Please try again.");
	};

	if (isLoading) {
		return <LoadingScreen />;
	}

	if (!data) {
		return <Alert type="error">We could not find this list.</Alert>;
	}

	if (deleteError) {
		return <Alert type="error">{deleteError}</Alert>;
	}

	return (
		<div className="container mx-auto flex flex-col px-0.5 w-full">
			{data && (
				<div className="flex flex-col px-0.5">
					<div className="flex justify-between items-center mb-6">
						<h1 className="text-3xl font-semibold">{data.name}</h1>
						<div className="flex gap-4">
							{/* Only list owners can invite others. */}
							{data.userId === user?.id && !isAddToListOpen && (
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
							{data.userId === user?.id && (
								<Link
									to={`/lists/${data.id}/invites`}
									className="flex gap-2 text-black hover:bg-opacity-80 focus:bg-opacity-80"
								>
									<Share className="hover:cursor-pointer" />
								</Link>
							)}
							<ListMenu list={data} isOwnList={data.userId === user?.id} />
						</div>
					</div>
					{(data?.places?.length === 0 || isAddToListOpen) && (
						<div
							data-testid="add-to-list"
							className="mb-6 bg-slate-100 rounded-lg p-4 pb-8 relative z-10"
						>
							<label className="label font-semibold" htmlFor="search">
								Add a place
							</label>
							<PlacesAutocomplete
								apiKey={import.meta.env.VITE_GOOGLE_API_KEY}
								setSelected={onSelectedChanged}
								center={currentLocation}
							/>
						</div>
					)}
					{(data.places?.length === 0 || !data.places) && (
						<Alert type="info">
							This list is empty. Start adding places with the search bar above.
						</Alert>
					)}
					{/* TODO: Fix place mapping when API returns proper place data instead of item references */}
					<div className="grid gap-x-6 gap-y-14 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{/* Place items will be rendered here when API is updated */}
					</div>
				</div>
			)}
		</div>
	);
}

export { ErrorBoundary };
