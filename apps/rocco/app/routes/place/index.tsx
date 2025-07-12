import { ListPlus } from "lucide-react";
import { useCallback } from "react";
import { useParams } from "react-router";
import AddPlaceToList from "~/components/places/AddPlaceToList";
import PlaceAddress from "~/components/places/PlaceAddress";
import PlacePhotos from "~/components/places/PlacePhotos";
import PlaceTypes from "~/components/places/PlaceTypes";
import PlaceWebsite from "~/components/places/PlaceWebsite";
import { Button } from "~/components/ui/button";
import { useToast } from "~/components/use-toast";
import { trpc } from "~/lib/trpc/client";
import type { Route } from "./+types";
import { usePlaceContext } from "./place-context";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
	// For now, return empty data and let the client fetch with tRPC
	return { place: null };
}

export default function PlacePage() {
	const { id } = useParams();
	const { data: placeData, isLoading } = trpc.places.getWithLists.useQuery({ 
		id: id || "" 
	});
	const place = placeData?.place;
	const { openToast } = useToast();
	const { openSaveSheet, isSaveSheetOpen } = usePlaceContext();

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (!place) {
		return <div>Place not found</div>;
	}

	const onAddToListSuccess = useCallback(() => {
		openToast({
			type: "success",
			text: `${place.name} added to list!`,
		});
	}, [openToast, place]);

	const onSaveClick = useCallback(() => {
		openSaveSheet();
	}, [openSaveSheet]);

	return (
		<div data-testid="place-page" className="mt-3 w-full">
			<PlacePhotos alt={place.name} photos={place.photos} />
			<div className="rounded-box bg-slate-100 mt-4 px-4 py-6">
				<div className="mb-4">
					<p className="font-bold text-xl mb-2">{place.name}</p>
					<PlaceTypes types={place.types || []} />
				</div>
				{place.address && (
					<div className="flex mt-2">
						<PlaceAddress
							address={place.address}
							name={place.name}
							place_id={place.googleMapsId || ""}
						/>
					</div>
				)}
				{place.websiteUri && (
					<div className="flex mt-2">
						<PlaceWebsite website={place.websiteUri} />
					</div>
				)}
				{/* TODO: Add lists property to Place type when implementing list-place relationships */}
			</div>
			<div className="modal-action">
				<Button className="flex gap-2" onClick={onSaveClick} disabled={false}>
					<ListPlus size={16} />
					Save to list
				</Button>
			</div>
			{isSaveSheetOpen && (
				<AddPlaceToList place={place} onSuccess={onAddToListSuccess} />
			)}
		</div>
	);
}
