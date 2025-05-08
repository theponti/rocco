import styled from "@emotion/styled";
import { ExternalLink, MoreVertical, Star } from "lucide-react";
import {
	type MouseEvent,
	type KeyboardEvent as ReactKeyboardEvent,
	useState,
} from "react";
import { href, useNavigate } from "react-router";

import { Button } from "~/components/button";
import PlaceTypes from "~/components/places/PlaceTypes";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Sheet, SheetContent } from "~/components/ui/sheet";
import { useRemoveListItem } from "~/lib/api/places";
import type { ListPlace } from "~/lib/types";

const PlaceCard = styled.button`
  all: unset;
  display: block;
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  transition: all 0.3s ease;
  background: rgba(30, 30, 36, 0.5);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 10px 30px -15px rgba(0, 0, 0, 0.3);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 15px 40px -10px rgba(99, 102, 241, 0.3);
    border-color: rgba(99, 102, 241, 0.3);
  }
  
  .image-container {
    border-radius: 12px;
    overflow: hidden;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 30%;
      background: linear-gradient(to top, rgba(15, 15, 20, 0.7), transparent);
      z-index: 1;
    }
  }
  
  .place-name {
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -3px;
      left: 0;
      width: 0;
      height: 2px;
      background: linear-gradient(90deg, #6366f1, #8b5cf6);
      transition: width 0.3s ease;
    }
  }
  
  &:hover .place-name::after {
    width: 40%;
  }
`;

const DeleteButton = styled(Button)`
  background: linear-gradient(135deg, #f43f5e, #ef4444);
  border: none;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(239, 68, 68, 0.4);
  }
`;

const ListItem = ({
	listId,
	place,
	onError,
	onDelete,
}: {
	listId: string;
	onError: () => void;
	onDelete: (listId: string) => void;
	place: ListPlace;
}) => {
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const navigate = useNavigate();
	const { mutateAsync } = useRemoveListItem({
		onSuccess: () => onDelete(place.id),
		onError,
	});

	const handlePlaceNavigation = (
		e: MouseEvent<HTMLButtonElement> | ReactKeyboardEvent<HTMLButtonElement>,
	) => {
		e.preventDefault();
		navigator.vibrate?.(10);
		navigate(href("/places/:id", { id: place.googleMapsId }));
	};

	const onDeleteMenuItemClick = async (e: MouseEvent<HTMLDivElement>) => {
		e.stopPropagation();
		setIsDeleteModalOpen(true);
	};

	const onDeleteClick = async (e: MouseEvent<HTMLButtonElement>) => {
		await mutateAsync({ listId, placeId: place.googleMapsId });
		setIsDeleteModalOpen(false);
	};

	const handleOpenGoogleMaps = (
		e: MouseEvent<HTMLButtonElement> | ReactKeyboardEvent<HTMLButtonElement>,
		placeName: string,
	) => {
		e.stopPropagation();
		window.open(`https://maps.google.com/?q=${placeName}`, "_blank");
	};

	// Format rating to always have 1 decimal place
	const formattedRating = place.rating?.toFixed(1);

	return (
		<>
			<PlaceCard
				tabIndex={0}
				data-testid="place-item"
				className="flex flex-col w-full h-fit cursor-pointer"
				onClick={handlePlaceNavigation}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						handlePlaceNavigation(e);
					}
				}}
			>
				<div className="image-container w-full h-[180px] mb-1">
					<img
						src={place.imageUrl}
						alt={place.name}
						className="object-cover w-full h-full transition-all hover:scale-105"
					/>

					{formattedRating && (
						<div className="absolute bottom-3 left-3 z-10 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1 text-white text-xs font-medium">
							<Star size={12} fill="#facc15" className="text-yellow-400" />
							<span>{formattedRating}</span>
						</div>
					)}

					<div className="absolute top-3 right-3 z-10">
						<DropdownMenu>
							<DropdownMenuTrigger
								data-testid="place-dropdownmenu-trigger"
								className="bg-black/50 backdrop-blur-sm rounded-full p-1.5 text-white hover:bg-black/70 transition-colors"
								onClick={(e) => e.stopPropagation()}
							>
								<MoreVertical size={16} />
							</DropdownMenuTrigger>
							<DropdownMenuContent className="bg-zinc-900/95 border border-white/10 text-white backdrop-blur-md">
								<DropdownMenuItem
									data-testid="place-delete-button"
									onClick={onDeleteMenuItemClick}
									className="text-red-400 hover:text-red-300 focus:text-red-300 hover:bg-white/5 focus:bg-white/5"
								>
									Delete
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>

				<div className="flex w-full max-w-full p-3">
					<div className="flex flex-col flex-1 h-full justify-between text-wrap break-words">
						<p className="font-semibold text-start place-name text-white mb-1 group-hover:text-indigo-300 transition-colors">
							{place.name}
						</p>
						<div className="flex items-center mt-1">
							<PlaceTypes limit={2} types={place.types} />
						</div>
					</div>
					<Button
						type="button"
						className="ml-2 p-1.5 rounded-full bg-indigo-500/20 hover:bg-indigo-500/30 transition-colors"
						onClick={(e: MouseEvent<HTMLButtonElement>) =>
							handleOpenGoogleMaps(e, place.name)
						}
						aria-label={`Open ${place.name} in Google Maps`}
					>
						<ExternalLink size={14} className="text-indigo-400" />
					</Button>
				</div>
			</PlaceCard>

			<Sheet open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
				<SheetContent
					data-testid="place-delete-modal"
					className="bg-zinc-900/95 border-l border-white/10 text-white backdrop-blur-md"
				>
					<div className="flex flex-col gap-4 mt-8">
						<h2 className="text-2xl font-semibold">Delete place</h2>
						<p className="text-white/70">
							Are you sure you want to delete{" "}
							<span className="font-medium text-white">{place.name}</span> from
							your list?
						</p>
						<div className="mt-6 flex gap-4 justify-end">
							<Button
								type="button"
								onClick={() => setIsDeleteModalOpen(false)}
								className="bg-transparent border border-white/10 text-white hover:bg-white/10"
							>
								Cancel
							</Button>
							<DeleteButton
								type="button"
								data-testid="place-delete-confirm-button"
								onClick={onDeleteClick}
							>
								Delete
							</DeleteButton>
						</div>
					</div>
				</SheetContent>
			</Sheet>
		</>
	);
};

export default ListItem;
