import { PlusCircle } from "lucide-react";
import { useCallback, useState } from "react";
import Button from "~/components/Button";

import ListForm from "app/components/ListForm";
import Lists from "app/components/Lists";
import api from "app/lib/api";
import { useLoaderData } from "react-router";
import { LoadingScreen } from "~/components/Loading";

export async function loader() {
	try {
		const response = await api.get("/lists");
		return { lists: response.data };
	} catch (error) {
		console.error("Failed to fetch lists:", error);
		throw new Response("Could not load lists.", { status: 500 });
	}
}

function ListsScene() {
	const { lists: data } = useLoaderData() as { lists: any[] };
	const [isListFormOpen, setIsListFormOpen] = useState(false);

	const refetch = useCallback(async () => {
		// This will trigger a re-render with the client loader
		window.location.reload();
	}, []);

	const onAddListClick = useCallback(() => {
		setIsListFormOpen(true);
	}, []);

	const onListCreate = useCallback(() => {
		setIsListFormOpen(false);
		refetch();
	}, [refetch]);

	const onListFormCancel = useCallback(() => {
		setIsListFormOpen(false);
	}, []);

	return (
		<div className="flex flex-col w-full">
			<div className="flex items-center justify-between pb-4">
				<h1 className="text-3xl font-bold">Lists</h1>
				{!isListFormOpen ? (
					<Button
						className="bg-transparent"
						onClick={onAddListClick}
						disabled={isListFormOpen}
					>
						<PlusCircle size={24} className="text-primary" />
					</Button>
				) : null}
			</div>
			{isListFormOpen ? (
				<div className="mb-4">
					<ListForm onCancel={onListFormCancel} onCreate={onListCreate} />
				</div>
			) : null}
			<Lists status="success" lists={data} error={null} currentUserEmail={""} />
		</div>
	);
}

export default ListsScene;

// ErrorBoundary to handle errors
export function ErrorBoundary({ error }: { error: unknown }) {
	console.error(error);
	return <div>An unexpected error occurred while loading lists.</div>;
}
