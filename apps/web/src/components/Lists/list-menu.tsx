import { MoreVertical } from "lucide-react";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "src/components/ui/dropdown-menu";
import type { List } from "src/lib/types";

export default function ListMenu({
	list,
	isOwnList,
	...props
}: { list: List & { createdBy: { email: string } }; isOwnList: boolean }) {
	if (!isOwnList) {
		return null;
	}

	const onEditClick = () => {
		console.log("Edit list");
	};

	const onDeleteClick = () => {
		console.log("Delete list");
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger>
				<MoreVertical />
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuItem className="p-2" onClick={onEditClick}>
					Edit
				</DropdownMenuItem>
				<DropdownMenuItem className="p-2" onClick={onDeleteClick}>
					Delete
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
