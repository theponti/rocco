import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle, ExternalLink, ListPlus, PlusCircle } from "lucide-react";
import { useCallback, useState } from "react";
import { Link } from "react-router";
import ListForm from "~/components/lists-components/list-form";
import PlacePhotos from "~/components/places/PlacePhotos";
import { Button } from "~/components/ui/button";
import { Sheet, SheetContent, SheetHeader } from "~/components/ui/sheet";
import { useToast } from "~/components/ui/use-toast";
import { useAddPlaceToList, useRemoveListItem } from "~/lib/places";
import { trpc } from "~/lib/trpc/client";
import type { GooglePlaceData, Place } from "~/lib/types";

interface PlaceDrawerProps {
	place: Place | GooglePlaceData | null;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
}

type NewList = Omit<
	{
		id: string;
		name: string;
		createdAt: string;
		updatedAt: string;
	},
	"isInList"
>;

/**
 * Drawer component to display place details and list options
 */
const PlaceDrawer = ({ place, isOpen, onOpenChange }: PlaceDrawerProps) => {
	const { toast } = useToast();
	const [showCreateListForm, setShowCreateListForm] = useState(false);
	const queryClient = useQueryClient();

	// Fetch list options including isInList
	const googleMapsId =
		place && "googleMapsId" in place ? (place.googleMapsId ?? "") : "";
	const { data: listOptions = [] } = trpc.lists.getListOptions.useQuery(
		{ googleMapsId },
		{ enabled: !!googleMapsId },
	);

	// Remove or add mutation hooks
	const { mutate: removeFromList } = useRemoveListItem({
		onSuccess: (_, { listId }) => {
			const listName = listOptions.find((l) => l.id === listId)?.name || "list";
			toast({
				title: `${place?.name} removed from "${listName}"!`,
				variant: "destructive",
			});
		},
	});
	const { mutate: addToListMutation } = useAddPlaceToList({
		onSuccess: (_, { listIds }) => {
			const listName =
				listOptions.find((l) => l.id === listIds[0])?.name || "list";
			if (place) {
				toast({
					title: `${place.name} added to "${listName}"!`,
					variant: "default",
				});
			}
		},
	});

	// Handler to wrap add mutation
	const handleSaveToList = useCallback(
		(listId: string) => {
			if (!place) return;
			// Convert GooglePlaceData to Place if needed
			const placeToSave =
				"userId" in place
					? { ...place, photos: place.photos || [] }
					: ({
							...place,
							userId: "",
							createdAt: new Date().toISOString(),
							updatedAt: new Date().toISOString(),
							itemId: null,
							location: [place.longitude, place.latitude],
							isPublic: false,
							photos: place.photos || [],
						} as Place);
			addToListMutation({ listIds: [listId], place: placeToSave });
		},
		[addToListMutation, place],
	);

	const handleCreateListClick = () => setShowCreateListForm(true);
	const handleCancelCreateList = () => setShowCreateListForm(false);

	const handleListCreated = useCallback(
		(newList: NewList) => {
			setShowCreateListForm(false);
			queryClient.setQueryData(["lists.getAll"], (old: any) => {
				if (!old) return [newList];
				if (old.some((l: any) => l.id === newList.id)) return old;
				return [newList, ...old];
			});
			if (place) handleSaveToList(newList.id);
		},
		[queryClient, handleSaveToList, place],
	);

	if (!place) return null;

	return (
		<Sheet open={isOpen} onOpenChange={onOpenChange}>
			<SheetContent className="bg-white border-l border-gray-200 text-gray-900 backdrop-blur-md">
				<div className="mb-2">
					<PlacePhotos alt={place.name} photos={place.photos} />
				</div>
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
						<ExternalLink size={14} /> Open in Maps
					</Link>
				</SheetHeader>
				<div className="flex flex-col gap-2 px-2">
					{listOptions.length === 0 ? (
						<div className="flex flex-col gap-4">
							<p className="text-sm text-gray-600">
								You don't have any lists yet.
							</p>
							<Button
								onClick={handleCreateListClick}
								className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
							>
								<PlusCircle size={16} /> Create your first list
							</Button>
						</div>
					) : (
						<div className="space-y-2 max-h-64 overflow-y-auto mb-4">
							{listOptions.map((l) => (
								<button
									key={l.id}
									type="button"
									className={`w-full flex items-center justify-between p-3 rounded-md transition-colors text-gray-900 ${
										l.isInList
											? "bg-green-100 hover:bg-green-200"
											: "bg-gray-100 hover:bg-gray-200"
									}`}
									onClick={() => {
										if (l.isInList && place && "id" in place) {
											removeFromList({ listId: l.id, placeId: place.id });
										} else {
											handleSaveToList(l.id);
										}
									}}
								>
									<span>{l.name}</span>
									{l.isInList ? (
										<CheckCircle size={18} className="text-green-600" />
									) : (
										<ListPlus size={16} className="text-indigo-600" />
									)}
								</button>
							))}
						</div>
					)}
					{showCreateListForm && (
						<ListForm
							onCancel={handleCancelCreateList}
							onCreate={handleListCreated}
						/>
					)}
				</div>
			</SheetContent>
		</Sheet>
	);
};

export default PlaceDrawer;
