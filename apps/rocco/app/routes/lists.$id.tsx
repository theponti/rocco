import { PlusCircle, Share } from "lucide-react";
import { useCallback, useState } from "react";
import {
	Link,
	href,
	redirect,
	useLoaderData,
	useNavigate,
	useParams,
	useRouteLoaderData,
} from "react-router";

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

export const clientLoader = async ({ params }: any) => {
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
	const { user } = useRouteLoaderData("routes/layout") as {
		user: any;
		isAuthenticated: boolean;
	};
	const { currentLocation } = useGeolocation();
	const navigate = useNavigate();
	const [deleteError, setDeleteError] = useState<string | null>(null);
	const params = useParams<{ id: string }>();
	const { data: listData, isLoading } = trpc.lists.getById.useQuery({
		id: params.id || "",
	});
	const data = listData || null;
	const [isAddToListOpen, setIsAddToListOpen] = useState(false);

	const refetch = useCallback(async () => {
		// This will re-run the clientLoader
		window.location.reload();
	}, []);

	const { mutateAsync: getOrCreatePlace } =
		trpc.places.getOrCreateByGoogleMapsId.useMutation();

	const onSelectedChanged = useCallback(
		async (place: GooglePlacePrediction) => {
			try {
				// Get or create the place in our database
				const placeData = await getOrCreatePlace({
					googleMapsId: place.place_id,
				});
				// Navigate to the place page using our database ID
				navigate(href("/places/:id", { id: placeData.id }));
			} catch (error) {
				console.error("Failed to get or create place:", error);
				// Fallback: navigate with Google Maps ID
				navigate(href("/places/:id", { id: place.place_id }));
			}
		},
		[navigate, getOrCreatePlace],
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
						<div data-testid="add-to-list" className="py-4">
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
					{data.places?.length === 0 && !isAddToListOpen && (
						<Alert type="info">
							This list is empty. Start adding places with the search bar above.
						</Alert>
					)}
					{data.places && data.places.length > 0 && (
						<div className="grid gap-x-6 gap-y-14 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
							{data.places.map((place) => {
								// Convert database place to GooglePlaceData format
								const mappedPlace = {
									id: place.id,
									googleMapsId: place.googleMapsId,
									name: place.name,
									address: place.address,
									latitude: place.latitude || 0,
									longitude: place.longitude || 0,
									description: place.description,
									types: place.types,
									imageUrl: place.imageUrl,
									phoneNumber: place.phoneNumber,
									rating: place.rating,
									websiteUri: place.websiteUri,
									bestFor: place.bestFor,
									wifiInfo: place.wifiInfo,
									photos: place.photos,
									priceLevel: place.priceLevel,
								};

								return (
									<PlaceItem
										key={place.id}
										place={mappedPlace}
										listId={data.id}
										onError={handleDeleteError}
									/>
								);
							})}
						</div>
					)}
				</div>
			)}
		</div>
	);
}

export { ErrorBoundary };
