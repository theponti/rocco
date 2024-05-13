import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import api from "src/lib/api";
import type { List } from "src/lib/types";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";

export default function ListEditSheet({ list }: { list: List }) {
	const [name, setName] = useState(list.name);
	const [description, setDescription] = useState(list.description);
	const updateList = useMutation({
		mutationKey: ["updateList"],
		mutationFn: async (data: any) => {
			await api.put(`/lists/${list.id}`, data);
		},
	});

	const handleSave = () => {
		updateList.mutate({
			name,
			description,
		});
	};

	return (
		<Sheet>
			<SheetTrigger>Edit</SheetTrigger>
			<SheetContent>
				<h1 className="text-2xl font-bold">Edit list</h1>
				<form className="flex flex-col gap-4 mt-4" onSubmit={handleSave}>
					<div className="flex flex-col gap-2">
						<label htmlFor="name" className="text-sm font-semibold">
							Name
						</label>
						<input
							type="text"
							id="name"
							placeholder="Enter list name"
							className="input"
							defaultValue={list.name}
							value={list.name}
							onChange={(e) => setName(e.target.value)}
						/>
					</div>
					<div className="flex flex-col gap-2">
						<label htmlFor="description" className="text-sm font-semibold">
							Description
						</label>
						<textarea
							id="description"
							placeholder="Enter list description"
							className="input"
							defaultValue={list.description}
							value={list.description}
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
							type="submit"
							className="btn btn-primary"
							disabled={updateList.status === "pending"}
						>
							Save
						</Button>
						<button
							type="button"
							className="btn btn-secondary"
							onClick={() => {
								setName(list.name);
								setDescription(list.description);
							}}
						>
							Cancel
						</button>
					</div>
				</form>
			</SheetContent>
		</Sheet>
	);
}
