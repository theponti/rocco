import { useLoaderData } from "react-router";
import InviteListItem from "~/components/InviteListItem";
import { trpc } from "~/lib/trpc/client";

export async function loader() {
	// For now, return empty data and let the client fetch with tRPC
	return { invites: [] };
}

const Invites = () => {
	const { data: invites = [], refetch } = trpc.invites.getAll.useQuery();

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
