import { ExternalLink, ListPlus, PlusCircle, Star } from "lucide-react";
import { type MouseEvent, useCallback, useState } from "react";
import { Button } from "~/components/button";
import ListForm from "~/components/lists-components/list-form";
import PlaceTypes from "~/components/places/PlaceTypes";
import { Sheet, SheetContent, SheetHeader } from "~/components/ui/sheet";
import { useToast } from "~/components/use-toast";
import { useAddPlaceToList } from "~/lib/places";
import type { List, Place } from "~/lib/types";

interface PlaceDrawerProps {
	place: Place | null;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	lists: List[];
}

const PlaceDrawer = ({
	place,
	isOpen,
	onOpenChange,
	lists,
}: PlaceDrawerProps) => {
	const { openToast } = useToast();
	const [showCreateListForm, setShowCreateListForm] = useState(false);

	const { mutate: addToList } = useAddPlaceToList({
		onSuccess: (_, { listIds }) => {
			if (place) {
				// Find the list name for better user feedback
				const listName =
					lists.find((list) => list.id === listIds[0])?.name || "list";
				openToast({
					type: "success",
					text: `${place.name} added to "${listName}"!`,
				});
			}
		},
	});

	const handleSaveToList = useCallback(
		(listId: string) => {
			if (!place) return;

			addToList({
				listIds: [listId],
				place,
			});

			// Don't close the drawer - keep it open to show feedback
			// onOpenChange(false);
		},
		[addToList, place],
	);

	const handleCreateListClick = useCallback(() => {
		setShowCreateListForm(true);
	}, []);

	const handleCancelCreateList = useCallback(() => {
		setShowCreateListForm(false);
	}, []);

	const handleListCreated = useCallback(
		(newList: List) => {
			setShowCreateListForm(false);
			// The lists will be updated automatically via the cache invalidation in useCreateList

			// Add the current place to the newly created list
			if (place) {
				addToList({
					listIds: [newList.id],
					place,
				});

				// Show success message
				openToast({
					type: "success",
					text: `${place.name} added to "${newList.name}" list!`,
				});
			}
		},
		[place, addToList, openToast],
	);

	const handleOpenGoogleMaps = (
		e: MouseEvent<HTMLButtonElement>,
		placeName: string,
	) => {
		e.stopPropagation();
		window.open(`https://maps.google.com/?q=${placeName}`, "_blank");
	};

	// Format rating to display
	const formattedRating = place?.rating ? place.rating.toFixed(1) : null;

	if (!place) return null;

	return (
		<Sheet open={isOpen} onOpenChange={onOpenChange}>
			<SheetContent className="bg-zinc-900/95 border-l border-white/10 text-white backdrop-blur-md">
				<SheetHeader className="flex flex-col gap-2 mt-4 text-left">
					<h2 className="text-2xl font-bold">{place.name}</h2>
					<p className="text-white/70 text-sm">{place.address}</p>
				</SheetHeader>

				<div className="mt-5 flex items-center gap-2">
					{place.types && place.types.length > 0 && (
						<PlaceTypes limit={3} types={place.types} />
					)}
				</div>

				{formattedRating && (
					<div className="mt-4 flex items-center gap-1">
						<Star size={16} fill="#facc15" className="text-yellow-400" />
						<span className="text-sm">{formattedRating}</span>
					</div>
				)}

				<div className="mt-6">
					<Button
						className="w-full flex items-center justify-center gap-2"
						onClick={(e) => handleOpenGoogleMaps(e, place.name)}
					>
						<ExternalLink size={14} />
						Open in Google Maps
					</Button>
				</div>

				<div className="mt-8">
					<h3 className="text-lg font-semibold mb-3">Save to List</h3>

					{showCreateListForm ? (
						<ListForm
							onCancel={handleCancelCreateList}
							onCreate={handleListCreated}
						/>
					) : (
						<>
							{lists.length === 0 ? (
								<div className="flex flex-col gap-4">
									<p className="text-sm text-white/70">
										You don't have any lists yet.
									</p>
									<Button
										onClick={handleCreateListClick}
										className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700"
									>
										<PlusCircle size={16} />
										Create your first list
									</Button>
								</div>
							) : (
								<>
									<div className="space-y-2 max-h-64 overflow-y-auto mb-4">
										{lists.map((list) => (
											<button
												type="button"
												key={list.id}
												onClick={() => handleSaveToList(list.id)}
												className="w-full flex items-center justify-between p-3 rounded-md bg-white/5 hover:bg-white/10 transition-colors"
											>
												<span>{list.name}</span>
												<ListPlus size={16} className="text-indigo-400" />
											</button>
										))}
									</div>
									<Button
										onClick={handleCreateListClick}
										className="flex items-center justify-center gap-2 w-full bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300"
									>
										<PlusCircle size={16} />
										Create a new list
									</Button>
								</>
							)}
						</>
					)}
				</div>
			</SheetContent>
		</Sheet>
	);
};

export default PlaceDrawer;
