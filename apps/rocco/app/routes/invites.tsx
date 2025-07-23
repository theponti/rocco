import { useLoaderData, useRevalidator } from "react-router";
import InviteListItem from "~/components/InviteListItem";
import { caller } from "~/lib/trpc/server";
import type { Route } from "./+types";

export async function loader() {
	const invites = await caller.invites.getAll();
	return { invites };
}

const Invites = ({ loaderData }: Route.ComponentProps) => {
	const { invites } = useLoaderData<typeof loader>();
	const { revalidate } = useRevalidator();

	const handleAccept = () => {
		revalidate();
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
							onAccept={handleAccept}
						/>
					))}
				</ul>
			)}
		</>
	);
};

export default Invites;

export function ErrorBoundary({ error }: { error: unknown }) {
	console.error(error);
	return <div>An unexpected error occurred while loading invites.</div>;
}
