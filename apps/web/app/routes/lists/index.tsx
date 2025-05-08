import { getAuth } from "@clerk/react-router/ssr.server";
import { PlusCircle } from "lucide-react";
import { useCallback, useState } from "react";
import { redirect, useLoaderData } from "react-router";
import Button from "~/components/button";
import ListForm from "~/components/lists-components/list-form";
import Lists from "~/components/lists-components/lists";
import { LoadingScreen } from "~/components/loading";
import api from "~/lib/api";
import { baseURL } from "~/lib/api/base";
import type { List } from "~/lib/types";
import type { Route } from "./+types";

export async function loader(loaderArgs: Route.LoaderArgs) {
	const response = await getAuth(loaderArgs);

	if (!response) {
		return redirect("/login");
	}

	const token = await response.getToken();
	try {
		const res = await api.get<List[]>(`${baseURL}/lists`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		console.log("Fetched lists:", res.data);
		return { lists: res.data };
	} catch (error) {
		console.error("Failed to fetch lists:", error);
		// Throwing an error response triggers the nearest ErrorBoundary
		throw new Response("Could not load lists.", { status: 500 });
	}
}

function ListsScene() {
	const { lists: data } = useLoaderData() as { lists: List[] };
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

export function ErrorBoundary() {
	return <div>An unexpected error occurred while loading lists.</div>;
}

export function HydrateFallback() {
	return <LoadingScreen />;
}
