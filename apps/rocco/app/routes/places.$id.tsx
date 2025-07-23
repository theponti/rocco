import { ListPlus } from "lucide-react";
import { useCallback } from "react";
import { Link } from "react-router";
import z from "zod";
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
		<div data-testid="place-page" className="h-full overflow-y-auto p-6">
			<div className="space-y-6">
				<div className="flex flex-col">
					<h1 className="text-2xl font-light font-serif drop-shadow-lg">
						{place.name}
					</h1>
					<div className="mt-2">
						<PlaceTypes types={place.types || []} />
					</div>
				</div>

				<div className="rounded-xl overflow-hidden shadow-lg bg-white h-48">
					<PlacePhotos alt={place.name} photos={place.photos} />
				</div>

				{/* Info cards */}
				<div className="space-y-3">
					{place.address && (
						<div className="bg-white rounded-lg shadow p-3 flex flex-col gap-2">
							<span className="text-slate-500 font-semibold text-sm">
								Address:
							</span>
							<PlaceAddress
								address={place.address}
								name={place.name}
								place_id={place.googleMapsId || ""}
							/>
						</div>
					)}
					{place.websiteUri && (
						<div className="bg-white rounded-lg shadow p-3 flex flex-col gap-2">
							<span className="text-slate-500 font-semibold text-sm">
								Website:
							</span>
							<PlaceWebsite website={place.websiteUri} />
						</div>
					)}

					{/* Lists section */}
					{lists.length > 0 && (
						<div className="bg-white rounded-lg shadow p-3">
							<h3 className="font-semibold text-sm mb-2 text-slate-700">
								In these lists:
							</h3>
							<ul className="flex flex-wrap gap-1">
								{lists.map((list) => (
									<li key={list.id}>
										<Link
											to={`/lists/${list.id}`}
											className="px-3 py-1 text-xs rounded-full bg-indigo-50 text-indigo-700 font-medium shadow-sm hover:bg-indigo-100 transition-colors border border-indigo-100"
										>
											{list.name}
										</Link>
									</li>
								))}
							</ul>
						</div>
					)}
				</div>

				{/* Save to list button */}
				<div className="flex justify-center">
					<Button
						className="flex gap-2 px-4 py-2 rounded-full bg-indigo-600 text-white font-semibold shadow-md hover:bg-indigo-700 transition-colors text-sm w-full max-w-xs"
						onClick={onSaveClick}
						disabled={false}
					>
						<ListPlus size={16} />
						Save to list
					</Button>
				</div>
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
