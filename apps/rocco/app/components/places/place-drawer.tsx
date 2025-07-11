import { ExternalLink, ListPlus, PlusCircle, Star } from "lucide-react";
import { type MouseEvent, useCallback, useState } from "react";
import ListForm from "~/components/lists-components/list-form";
import PlaceTypes from "~/components/places/PlaceTypes";
import { Button } from "~/components/ui/button";
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
			<SheetContent className="bg-white border-l border-gray-200 text-gray-900 backdrop-blur-md">
				<SheetHeader className="mb-6">
					<h2 className="text-2xl font-semibold text-gray-900">{place.name}</h2>
					<p className="text-gray-600 text-sm">{place.address}</p>
				</SheetHeader>

				<div className="space-y-6">
					{/* Rating and Price Level */}
					<div className="flex items-center gap-4">
						{formattedRating && (
							<div className="flex items-center gap-2">
								<Star size={16} className="text-yellow-500 fill-current" />
								<span className="text-gray-900 font-medium">
									{formattedRating}
								</span>
							</div>
						)}
						{place.price_level > 0 && (
							<div className="text-gray-600">
								{"$".repeat(place.price_level)}
							</div>
						)}
					</div>

					{/* Place Types */}
					<div>
						<h3 className="text-sm font-medium text-gray-700 mb-2">Categories</h3>
						<PlaceTypes types={place.types} />
					</div>

					{/* Actions */}
					<div className="flex gap-3">
						<Button
							onClick={(e) => handleOpenGoogleMaps(e, place.name)}
							className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700"
						>
							<ExternalLink size={16} />
							Open in Maps
						</Button>
					</div>

					<div className="mt-8">
						<h3 className="text-lg font-semibold mb-3 text-gray-900">Save to List</h3>

						{showCreateListForm ? (
							<ListForm
								onCancel={handleCancelCreateList}
								onCreate={handleListCreated}
							/>
						) : (
							<>
								{lists.length === 0 ? (
									<div className="flex flex-col gap-4">
										<p className="text-sm text-gray-600">
											You don't have any lists yet.
										</p>
										<Button
											onClick={handleCreateListClick}
											className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
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
													className="w-full flex items-center justify-between p-3 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors text-gray-900"
												>
													<span>{list.name}</span>
													<ListPlus size={16} className="text-indigo-600" />
												</button>
											))}
										</div>
										<Button
											onClick={handleCreateListClick}
											className="flex items-center justify-center gap-2 w-full bg-indigo-100 hover:bg-indigo-200 text-indigo-700"
										>
											<PlusCircle size={16} />
											Create a new list
										</Button>
									</>
								)}
							</>
						)}
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
};

export default PlaceDrawer;
