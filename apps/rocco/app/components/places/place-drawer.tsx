import { ExternalLink, ListPlus, PlusCircle, Star } from "lucide-react";
import { useCallback, useState } from "react";
import { Link } from "react-router";
import ListForm from "~/components/lists-components/list-form";
import PlaceTypes from "~/components/places/PlaceTypes";
import { Button } from "~/components/ui/button";
import { Sheet, SheetContent, SheetHeader } from "~/components/ui/sheet";
import { useToast } from "~/components/ui/use-toast";
import { useAddPlaceToList } from "~/lib/places";
import { trpc } from "~/lib/trpc/client";
import type { GooglePlaceData, List, Place } from "~/lib/types";

interface PlaceDrawerProps {
	place: Place | GooglePlaceData | null;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
}

const PlaceDrawer = ({ place, isOpen, onOpenChange }: PlaceDrawerProps) => {
	const { toast } = useToast();
	const [showCreateListForm, setShowCreateListForm] = useState(false);
	const { data: lists = [] } = trpc.lists.getAll.useQuery();

	const { mutate: addToList } = useAddPlaceToList({
		onSuccess: (_, { listIds }) => {
			if (place) {
				// Find the list name for better user feedback
				const listName =
					lists.find((list) => list.id === listIds[0])?.name || "list";
				toast({
					title: `${place.name} added to "${listName}"!`,
					variant: "default",
				});
			}
		},
	});

	const handleSaveToList = useCallback(
		(listId: string) => {
			if (!place) return;

			// Convert GooglePlaceData to Place if needed
			const placeToSave =
				"userId" in place
					? place
					: ({
							...place,
							userId: "", // Will be set by the server
							createdAt: new Date().toISOString(),
							updatedAt: new Date().toISOString(),
							itemId: null,
							location: [place.longitude, place.latitude], // PostGIS point format [x, y]
							isPublic: false,
						} as Place);

			addToList({
				listIds: [listId],
				place: placeToSave,
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

			if (place) {
				const placeToSave =
					"userId" in place
						? place
						: ({
								...place,
								userId: "",
								createdAt: new Date().toISOString(),
								updatedAt: new Date().toISOString(),
								itemId: null,
								location: [place.longitude, place.latitude],
								isPublic: false,
							} as Place);

				addToList({
					listIds: [newList.id],
					place: placeToSave,
				});

				toast({
					title: `${place.name} added to "${newList.name}" list!`,
					variant: "default",
				});
			}
		},
		[place, addToList, toast],
	);

	const formattedRating = place?.rating ? place.rating.toFixed(1) : null;

	if (!place) return null;

	return (
		<Sheet open={isOpen} onOpenChange={onOpenChange}>
			<SheetContent className="bg-white border-l border-gray-200 text-gray-900 backdrop-blur-md">
				<SheetHeader className="flex flex-col gap-2 px-2">
					<div>
						<h2 className="text-2xl font-semibold text-gray-900">
							{place.name}
						</h2>
						<p className="text-gray-600 text-sm">{place.address}</p>
					</div>
					<Link
						target="_blank"
						to={`https://maps.google.com/?q=${place.name}`}
						className="flex items-center gap-1 text-primary text-sm"
					>
						<ExternalLink size={14} />
						Open in Maps
					</Link>
				</SheetHeader>

				<div className="flex flex-col gap-2 px-2">
					{formattedRating && (
						<div className="flex items-center gap-4">
							<div className="flex items-center gap-2">
								<Star size={16} className="text-yellow-500 fill-current" />
								<span className="text-gray-900 font-medium">
									{formattedRating}
								</span>
							</div>
						</div>
					)}

					{/* Place Types */}
					{place.types && (
						<div>
							<h3 className="text-sm font-medium text-gray-700 mb-2">
								Categories
							</h3>
							<PlaceTypes types={place.types || []} />
						</div>
					)}

					<div className="flex flex-col gap-2">
						{!showCreateListForm ? (
							<Button
								onClick={handleCreateListClick}
								className="flex items-center justify-center gap-2 w-full bg-indigo-100 hover:bg-indigo-200 text-indigo-700"
							>
								<PlusCircle size={16} />
								Create a new list
							</Button>
						) : null}

						{showCreateListForm ? (
							<ListForm
								onCancel={handleCancelCreateList}
								onCreate={handleListCreated}
							/>
						) : (
							<>
								<h3 className="text-lg font-semibold mb-3 text-gray-900">
									Save to List
								</h3>
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
