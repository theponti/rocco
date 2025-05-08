import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import Alert from "~/components/alert";
import { Button } from "~/components/button";
import Input from "~/components/input";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetTitle,
} from "~/components/ui/sheet";
import api from "~/lib/api";
import { baseURL } from "~/lib/api/base";
import type { List } from "~/lib/types";
import { useListMenu } from "./list-menu";

export default function ListEditSheet({ list }: { list: List }) {
	const { isEditSheetOpen, setIsEditSheetOpen } = useListMenu();
	const queryClient = useQueryClient();
	const [name, setName] = useState(list.name);
	const [description, setDescription] = useState(list.description);
	const updateList = useMutation({
		mutationKey: ["updateList"],
		mutationFn: async (data: { name: string; description: string }) => {
			const response = await api.put(`${baseURL}/lists/${list.id}`, data);
			return response.data;
		},
		onSuccess: () => {
			setIsEditSheetOpen(false);
			// Refetch the list or update the local state
			queryClient.invalidateQueries(
				{ queryKey: ["list", list.id] },
				{ cancelRefetch: true },
			);
		},
		onError: (error) => {
			// console.error("Error updating list:", error);
		},
		throwOnError: false,
	});

	const handleSave = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			try {
				await updateList.mutateAsync({
					name,
					description,
				});
			} catch (error) {
				// Error is handled by React Query's isError, so nothing to do here
			}
		},
		[name, description, updateList],
	);

	return (
		<Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
			<SheetContent>
				<SheetTitle>Edit list</SheetTitle>
				<SheetDescription>Update your list information</SheetDescription>
				<form
					data-testid="list-edit-form"
					className="flex flex-col gap-4 mt-4"
					onSubmit={handleSave}
				>
					<Input
						type="text"
						id="listName"
						label="Name"
						name="name"
						placeholder="Enter list name"
						autoComplete="off"
						value={name}
						onChange={(e) => setName(e.target.value)}
					/>
					<div className="flex flex-col gap-2">
						<label htmlFor="description" className="text-sm font-semibold">
							Description
						</label>
						<textarea
							id="description"
							placeholder="Enter list description"
							className="border-2 rounded-lg p-2 h-24 w-full"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
						/>
					</div>
					{/* <div className="flex flex-col gap-2">
						<label htmlFor="visibility" className="text-sm font-semibold">
							Visibility
						</label>
						<select
							id="visibility"
							className="input"
							defaultValue={list.visibility}
							value={list.visibility}
							onChange={(e) => setVisibility(e.target.value)}
						>
							<option value="public">Public</option>
							<option value="private">Private</option>
						</select>
					</div>
					<div className="flex flex-col gap-2">
						<label htmlFor="collaborators" className="text-sm font-semibold">
							Collaborators
						</label>
						<input
							type="text"
							id="collaborators"
							placeholder="Enter email addresses"
							className="input"
							defaultValue={list.collaborators}
							value={list.collaborators}
							onChange={(e) => setCollaborators(e.target.value)}
						/>
					</div>
					<div className="flex flex-col gap-2">
						<label htmlFor="tags" className="text-sm font-semibold">
							Tags
						</label>
						<input
							type="text"
							id="tags"
							placeholder="Enter tags"
							className="input"
							defaultValue={list.tags}
							value={list.tags}
							onChange={(e) => setTags(e.target.value)}
						/>
					</div> */}
					<div className="flex gap-4">
						<Button
							data-status={updateList.status}
							type="submit"
							className="btn btn-primary"
							disabled={updateList.status === "pending"}
						>
							Save
						</Button>
					</div>
				</form>
				{updateList.isError ? (
					<Alert type="error">
						There was an issue editing your list. Try again later.
					</Alert>
				) : null}
			</SheetContent>
		</Sheet>
	);
}
