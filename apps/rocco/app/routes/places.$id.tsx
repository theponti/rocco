import { ListPlus } from "lucide-react";
import { useCallback } from "react";
import { Link } from "react-router";
import z from "zod";
import LazyMap from "~/components/map.lazy";
import AddPlaceToList from "~/components/places/AddPlaceToList";
import PlaceAddress from "~/components/places/PlaceAddress";
import PlacePhotos from "~/components/places/PlacePhotos";
import PlaceTypes from "~/components/places/PlaceTypes";
import PlaceWebsite from "~/components/places/PlaceWebsite";
import { Button } from "~/components/ui/button";
import { useToast } from "~/components/ui/use-toast";
import { useSaveSheet } from "~/hooks/useSaveSheet";
import { trpc } from "~/lib/trpc/client";
import { caller } from "~/lib/trpc/server";
import type { Place } from "~/lib/types";
import type { Route } from "./+types/places.$id";

export async function loader({ params }: Route.LoaderArgs) {
	const { id } = params;
	if (!id) {
		throw new Error("Place ID is required");
	}

	const isUuid = z.uuid().safeParse(id).success;

	let data: Place;
	if (isUuid) {
		data = await caller.places.getById({ id });
	} else {
		data = await caller.places.getByGoogleMapsId({ googleMapsId: id });
	}

	if (!data) {
		throw new Error("Place not found");
	}

	return { place: data };
}

export default function PlacePage({ loaderData }: Route.ComponentProps) {
	const { place } = loaderData;
	const { toast } = useToast();
	const { isOpen, open, close } = useSaveSheet();

	const { data: lists = [] } = trpc.places.getListsForPlace.useQuery({
		placeId: place.id,
	});

	const onAddToListSuccess = useCallback(() => {
		toast({
			title: `${place.name} added to list!`,
			variant: "default",
		});
	}, [toast, place]);

	const onSaveClick = useCallback(() => {
		open();
	}, [open]);

	return (
		<div
			data-testid="place-page"
			className="w-full max-w-2xl mx-auto mt-6 pb-12 px-2 sm:px-0"
		>
			<div className="flex flex-col">
				<h1 className="text-3xl !font-light font-serif drop-shadow-lg">
					{place.name}
				</h1>
				<div className="mt-2">
					<PlaceTypes types={place.types || []} />
				</div>
			</div>

			<div className="rounded-2xl overflow-hidden shadow-lg mb-6 bg-white h-64">
				<PlacePhotos alt={place.name} photos={place.photos} />
			</div>

			{/* Info cards */}
			<div className="space-y-4">
				{place.address && (
					<div className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
						<span className="text-slate-500 font-semibold">Address:</span>
						<PlaceAddress
							address={place.address}
							name={place.name}
							place_id={place.googleMapsId || ""}
						/>
					</div>
				)}
				{place.websiteUri && (
					<div className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
						<span className="text-slate-500 font-semibold">Website:</span>
						<PlaceWebsite website={place.websiteUri} />
					</div>
				)}

				{/* Lists section */}
				{lists.length > 0 && (
					<div className="bg-white rounded-xl shadow p-4">
						<h3 className="font-semibold text-lg mb-3 text-slate-700">
							In these lists:
						</h3>
						<ul className="flex flex-wrap gap-2">
							{lists.map((list) => (
								<li key={list.id}>
									<Link
										to={`/lists/${list.id}`}
										className="px-4 py-1 rounded-full bg-indigo-50 text-indigo-700 font-medium shadow-sm hover:bg-indigo-100 transition-colors border border-indigo-100"
									>
										{list.name}
									</Link>
								</li>
							))}
						</ul>
					</div>
				)}
			</div>

			{/* Map section */}
			{place.latitude && place.longitude && (
				<div className="mt-8">
					<h3 className="font-semibold text-lg mb-3 text-slate-700">
						Location
					</h3>
					<div className="h-64 w-full rounded-2xl overflow-hidden shadow-lg border border-slate-100">
						<LazyMap
							zoom={15}
							center={{ latitude: place.latitude, longitude: place.longitude }}
							markers={[
								{ latitude: place.latitude, longitude: place.longitude },
							]}
							isLoadingCurrentLocation={false}
						/>
					</div>
				</div>
			)}

			{/* Save to list button */}
			<div className="flex justify-end mt-8">
				<Button
					className="flex gap-2 px-6 py-2 rounded-full bg-indigo-600 text-white font-semibold shadow-md hover:bg-indigo-700 transition-colors text-base"
					onClick={onSaveClick}
					disabled={false}
				>
					<ListPlus size={18} />
					Save to list
				</Button>
			</div>
			<AddPlaceToList
				place={place}
				isOpen={isOpen}
				onOpenChange={close}
				onSuccess={onAddToListSuccess}
			/>
		</div>
	);
}
