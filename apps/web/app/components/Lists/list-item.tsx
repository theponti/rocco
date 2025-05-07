import styled from "@emotion/styled";
import {
	BookmarkPlus,
	ChevronsRight,
	Globe,
	MoreVertical,
	Users,
} from "lucide-react";
import { Link } from "react-router";

import ListDeleteButton from "~/components/ListDeleteButton";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { List, User } from "~/lib/types";

const ListCard = styled.li`
  position: relative;
  border-radius: 16px;
  transition: all 0.3s ease;
  background: rgba(30, 30, 36, 0.5);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 10px 30px -15px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 40px -10px rgba(99, 102, 241, 0.3);
    border-color: rgba(99, 102, 241, 0.2);
  }
  
  .list-name {
    position: relative;
    display: inline;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 0;
      height: 2px;
      background: linear-gradient(90deg, #6366f1, #8b5cf6);
      transition: width 0.3s ease;
    }
  }
  
  &:hover .list-name::after {
    width: 100%;
  }
`;

interface ListItemProps {
	list: List & { createdBy: User; isOwnList?: boolean };
	isOwnList: boolean;
	"aria-label"?: string;
}

function ListItem({ list, isOwnList, "aria-label": ariaLabel }: ListItemProps) {
	const placeCount = list.places?.length ?? 0;

	return (
		<ListCard
			data-testid={`list-item-${list.id}`}
			className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 p-4"
			aria-label={ariaLabel}
		>
			<div className="flex flex-col flex-1 min-w-0">
				<div className="flex items-center gap-2 mb-1">
					<div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center">
						<Globe size={16} className="text-indigo-400" />
					</div>
					<h3 className="text-lg font-medium text-white truncate">
						<span className="list-name">{list.name}</span>
					</h3>
				</div>

				<div className="flex items-center gap-4 text-white/60 text-sm mt-1">
					<div className="flex items-center gap-1.5">
						<BookmarkPlus size={14} />
						<span>
							{placeCount} {placeCount === 1 ? "place" : "places"}
						</span>
					</div>

					{list.isPublic && (
						<div className="flex items-center gap-1.5">
							<Users size={14} />
							<span>Public</span>
						</div>
					)}
				</div>
			</div>

			<div className="flex items-center gap-2 self-end md:self-center">
				{isOwnList && (
					<DropdownMenu>
						<DropdownMenuTrigger
							className="bg-white/5 hover:bg-white/10 rounded-full p-2 text-white transition-colors"
							data-testid={`list-dropdown-${list.id}`}
						>
							<MoreVertical size={16} />
						</DropdownMenuTrigger>
						<DropdownMenuContent className="bg-zinc-900/95 border border-white/10 text-white backdrop-blur-md">
							<DropdownMenuItem asChild>
								<Link
									to={`/lists/${list.id}/edit`}
									className="flex w-full items-center gap-2 cursor-pointer"
								>
									Edit
								</Link>
							</DropdownMenuItem>

							<DropdownMenuItem asChild>
								<Link
									to={`/lists/${list.id}/invites`}
									className="flex w-full items-center gap-2 cursor-pointer"
								>
									Invites
								</Link>
							</DropdownMenuItem>

							{isOwnList && (
								<DropdownMenuItem>
									<ListDeleteButton
										listId={list.id}
										name={list.name}
										className="text-red-400 hover:text-red-300 focus:text-red-300 w-full text-left"
									>
										Delete
									</ListDeleteButton>
								</DropdownMenuItem>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				)}

				<Link
					to={`/lists/${list.id}`}
					data-testid={`list-view-button-${list.id}`}
					className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-600/90 to-indigo-600/80 hover:from-indigo-600 hover:to-indigo-600 rounded-lg text-white text-sm font-medium transition-all hover:shadow-lg hover:shadow-indigo-500/20"
				>
					View
					<ChevronsRight size={16} />
				</Link>
			</div>
		</ListCard>
	);
}

export default ListItem;
