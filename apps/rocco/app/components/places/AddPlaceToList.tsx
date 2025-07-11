import { Heart } from "lucide-react";

import { Sheet, SheetContent } from "~/components/ui/sheet";
import { useGetLists } from "~/lib/api";
import {
    useAddPlaceToList,
    useGetPlaceLists,
    useRemoveListItem,
} from "~/lib/places";
import type { Place } from "~/lib/types";
import { cn } from "~/lib/utils";
import { usePlaceContext } from "~/routes/place/place-context";
import styles from "./AddPlaceToList.module.css";

const AddPlaceToList = ({
	onSuccess,
	place,
}: {
	onSuccess: () => void;
	place: Place | null;
}) => {
	if (!place) {
		return null; // Early return if place is null
	}
	const { isSaveSheetOpen, setIsSaveSheetOpen } = usePlaceContext();
	const { isLoading, data: lists } = useGetLists();
	const { data: placeLists, isLoading: isPlaceListLoading } = useGetPlaceLists({
		placeId: place.id,
	});
	const { mutateAsync: removeFromList } = useRemoveListItem({});
	const { mutate: addToList } = useAddPlaceToList({
		onSuccess: () => {
			onSuccess?.();
		},
	});
	const listIds = placeLists?.map((list) => list.id) ?? [];

	const onListSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (listIds.includes(e.target.id)) {
			removeFromList({ listId: e.target.id, placeId: place.id });
			return;
		}

		addToList({ listIds: [e.target.id], place });
	};

	// List of lists displaying their name and a round checkbox that when clicked adds the list to the listIds array
	return (
		<Sheet open={isSaveSheetOpen} onOpenChange={setIsSaveSheetOpen}>
			<SheetContent className="pt-10 px-4">
				<div className="my-6">
					<h2 className="text-xl font-bold">Add to lists</h2>
					<p className="text-sm">Select lists to add this place to.</p>
				</div>
				{isLoading || isPlaceListLoading ? (
					<div className="flex items-center justify-center h-16">
						<div className="loading loading-infinity w-14" />
					</div>
				) : (
					<ul className="list-none">
						{lists?.map((list) => (
							<li
								key={list.id}
								className={`${styles.listItem} relative border hover:cursor-pointer`}
							>
								<label
									htmlFor={list.id}
									className="flex justify-between items-center hover:cursor-pointer p-2"
								>
									<input
										type="checkbox"
										id={list.id}
										className="absolute h-full w-full invisible -ml-2"
										checked={listIds.includes(list.id)}
										onChange={onListSelectChange}
									/>
									{list.name}
									<Heart
										size={24}
										className={cn({
											"fill-red-500": listIds.includes(list.id),
										})}
									/>
								</label>
							</li>
						))}
					</ul>
				)}
			</SheetContent>
		</Sheet>
	);
};

export default AddPlaceToList;
