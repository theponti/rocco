import { trpc } from "../lib/trpc/client";

export function TRPCExample() {
	const { data: lists, isLoading: listsLoading } = trpc.lists.getAll.useQuery();
	const { data: ideas, isLoading: ideasLoading } = trpc.ideas.getAll.useQuery();

	const createList = trpc.lists.create.useMutation();
	const createIdea = trpc.ideas.create.useMutation();

	const handleCreateList = () => {
		createList.mutate({
			name: "My New List",
			description: "A description for my new list",
			isPublic: false,
		});
	};

	const handleCreateIdea = () => {
		createIdea.mutate({
			description: "A new idea I had",
		});
	};

	if (listsLoading || ideasLoading) {
		return <div>Loading...</div>;
	}

	return (
		<div className="p-4">
			<h2 className="text-2xl font-bold mb-4">tRPC Example</h2>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<h3 className="text-lg font-semibold mb-2">Lists</h3>
					<button
						onClick={handleCreateList}
						className="bg-blue-500 text-white px-4 py-2 rounded mb-2"
						disabled={createList.isPending}
					>
						{createList.isPending ? "Creating..." : "Create List"}
					</button>
					<ul className="space-y-2">
						{lists?.map((list) => (
							<li key={list.id} className="p-2 border rounded">
								<strong>{list.name}</strong>
								<p className="text-sm text-gray-600">{list.description}</p>
							</li>
						))}
					</ul>
				</div>

				<div>
					<h3 className="text-lg font-semibold mb-2">Ideas</h3>
					<button
						onClick={handleCreateIdea}
						className="bg-green-500 text-white px-4 py-2 rounded mb-2"
						disabled={createIdea.isPending}
					>
						{createIdea.isPending ? "Creating..." : "Create Idea"}
					</button>
					<ul className="space-y-2">
						{ideas?.map((idea) => (
							<li key={idea.id} className="p-2 border rounded">
								<p>{idea.description}</p>
							</li>
						))}
					</ul>
				</div>
			</div>
		</div>
	);
}
