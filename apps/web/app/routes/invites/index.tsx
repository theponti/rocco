import InviteListItem from "app/components/InviteListItem";
import api from "app/lib/api";
import { useLoaderData } from "react-router";

export async function loader() {
	try {
		const response = await api.get("/invites");
		return { invites: response.data };
	} catch (error) {
		console.error("Failed to fetch invites:", error);
		throw new Response("Could not load invites.", { status: 500 });
	}
}

const Invites = () => {
	const { invites } = useLoaderData() as { invites: any[] };
	const refetch = async () => {
		// This will trigger a re-render with the client loader
		window.location.reload();
	};

	return (
		<>
			<h1 className="text-4xl mb-4">Invites</h1>
			{invites && (
				<ul className="space-y-4">
					{invites.map((listInvite) => (
						<InviteListItem
							key={listInvite.listId}
							listInvite={listInvite}
							onAccept={refetch}
						/>
					))}
				</ul>
			)}
		</>
	);
};

export default Invites;

// ErrorBoundary to handle errors
export function ErrorBoundary({ error }: { error: unknown }) {
	console.error(error);
	return <div>An unexpected error occurred while loading invites.</div>;
}
