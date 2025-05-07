import Loading from "app/components/Loading";

import IdeaForm from "app/components/IdeaForm";
import IdeaListItem from "app/components/IdeaListItem";
import api from "app/lib/api";
import { useLoaderData } from "react-router";

export async function loader() {
	try {
		const response = await api.get("/ideas");
		return { ideas: response.data };
	} catch (error) {
		console.error("Failed to fetch ideas:", error);
		throw new Response("Could not load ideas.", { status: 500 });
	}
}

const Ideas = () => {
	const { ideas: data } = useLoaderData() as { ideas: any[] };
	const refetch = async () => {
		window.location.reload();
	};

	return (
		<>
			<IdeaForm onCreate={refetch} />
			<div>
				{!data && <Loading />}
				{data?.length === 0 && "your thoughts will appear here"}
				{data && data.length > 0 && (
					<ul className="space-y-2">
						{data.map((idea) => (
							<IdeaListItem key={idea.id} idea={idea} onDelete={refetch} />
						))}
					</ul>
				)}
			</div>
		</>
	);
};

export default Ideas;

// ErrorBoundary to handle errors
export function ErrorBoundary({ error }: { error: unknown }) {
	console.error(error);
	return <div>An unexpected error occurred while loading ideas.</div>;
}
