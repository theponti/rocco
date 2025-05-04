import AddPlaceToList from "app/components/places/AddPlaceToList";
import PlaceAddress from "app/components/places/PlaceAddress";
import PlacePhotos from "app/components/places/PlacePhotos";
import PlaceTypes from "app/components/places/PlaceTypes";
import PlaceWebsite from "app/components/places/PlaceWebsite";
import { Button } from "app/components/ui/button";
import { useToast } from "app/lib/toast/hooks";
import { ListPlus } from "lucide-react";
import { useCallback } from "react";
import { Link, href, redirect } from "react-router";
import { api } from "~/lib/api/base";
import type { Place } from "~/lib/types";
import type { Route } from "./+types";
import { usePlaceContext } from "./place-context";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
	const place = (await api.get(`/places/${params.id}/lists`)) as {
		data: Place;
	};

	if (!place) {
		throw redirect("/404");
	}

	return place.data;
}

export default function PlacePage({ loaderData }: Route.ComponentProps) {
	const place = loaderData;
	const { openToast } = useToast();
	const { openSaveSheet, isSaveSheetOpen } = usePlaceContext();

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
		<div className="mt-3 w-full">
			<PlacePhotos alt={place.name} photos={place.photos} />
			<div className="rounded-box bg-slate-100 mt-4 px-4 py-6">
				<div className="mb-4">
					<p className="font-bold text-xl mb-2">{place.name}</p>
					<PlaceTypes types={place.types} />
				</div>
				{place.address && (
					<div className="flex mt-2">
						<PlaceAddress
							address={place.address}
							name={place.name}
							place_id={place.googleMapsId}
						/>
					</div>
				)}
				{place.websiteUri && (
					<div className="flex mt-2">
						<PlaceWebsite website={place.websiteUri} />
					</div>
				)}
				{place.lists && place.lists.length > 0 && (
					<div className="gap-2 mt-4">
						<p className="font-bold text-sm">Saved your lists:</p>
						<div className="flex flex-wrap gap-2 mt-2">
							{place.lists.map((list) => (
								<Link
									className="rounded-lg px-2 py-1 border border-blue-500 text-blue-500 text-sm hover:bg-blue-500 hover:text-white transition-colors duration-200 ease-in-out"
									key={list.id}
									to={href("/lists/:id", { id: list.id })}
								>
									{list.name}
								</Link>
							))}
						</div>
					</div>
				)}
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
