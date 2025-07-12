import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useCreateList } from "~/lib/trpc/api";
import type { List } from "~/lib/types";
import { Label } from "../ui/label";

interface ListFormProps {
	onCreate: (list: List) => void;
	onCancel: () => void;
}

export default function ListForm({ onCreate, onCancel }: ListFormProps) {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");

	const { mutate: createList, isPending } = useCreateList({
		onSuccess: (newList) => {
			onCreate(newList);
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (name.trim()) {
			createList({
				name: name.trim(),
				description: description.trim() || "No description",
			});
		}
	};

	return (
		<div className="space-y-4">
			<h3 className="text-lg font-semibold text-gray-900">Create New List</h3>

			<form onSubmit={handleSubmit} className="flex flex-col gap-4">
				<fieldset className="flex flex-col gap-2">
					<Label>List Name</Label>
					<Input
						placeholder="Enter list name..."
						value={name}
						onChange={(e) => setName(e.target.value)}
						required
					/>
				</fieldset>

				<fieldset className="flex flex-col gap-2">
					<Label>Description (optional)</Label>
					<Input
						placeholder="Enter description..."
						value={description}
						onChange={(e) => setDescription(e.target.value)}
					/>
				</fieldset>
				<div className="flex gap-3 pt-4">
					<Button
						type="button"
						onClick={onCancel}
						className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
					>
						Cancel
					</Button>
					<Button
						type="submit"
						disabled={isPending || !name.trim()}
						className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
					>
						{isPending ? "Creating..." : "Create List"}
					</Button>
				</div>
			</form>
		</div>
	);
}
