import { useState } from "react";
import Input from "~/components/input";
import { Button } from "~/components/ui/button";
import { useCreateList } from "~/lib/api";
import type { List } from "~/lib/types";

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
			createList({ name: name.trim() });
		}
	};

	return (
		<div className="space-y-4">
			<h3 className="text-lg font-semibold text-gray-900">Create New List</h3>
			
			<form onSubmit={handleSubmit} className="space-y-4">
				<Input
					label="List Name"
					placeholder="Enter list name..."
					value={name}
					onChange={(e) => setName(e.target.value)}
					required
					className="w-full bg-white border-gray-300 focus:border-indigo-500 rounded-lg text-gray-900"
				/>
				
				<Input
					label="Description (optional)"
					placeholder="Enter description..."
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					className="w-full bg-white border-gray-300 focus:border-indigo-500 rounded-lg text-gray-900"
				/>

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
