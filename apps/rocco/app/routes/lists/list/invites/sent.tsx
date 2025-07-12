import { useNavigate } from "react-router";
import AppLink from "~/components/app-link";
import { useAuth } from "~/lib/auth-provider";
import { trpc } from "~/lib/trpc/client";

export async function clientLoader() {
	// For now, return empty data and let the client fetch with tRPC
	return { outboundInvites: [] };
}

const ListSentInvites = ({
	loaderData,
}: { loaderData: { outboundInvites: any[] } }) => {
	const navigate = useNavigate();
	const { user } = useAuth();
	// TODO: Add outbound invites to tRPC router
	const { data: outboundInvites = [] } = trpc.invites.getAll.useQuery();
	const data = outboundInvites;

	if (user?.id) {
		navigate("/");
	}

	return (
		<>
			<div className="my-4">
				<AppLink btn to="/lists/invites">
					<span className="mr-1">⬅️</span> Back to invites
				</AppLink>
			</div>
			<h1>Sent Invites</h1>
			<div>
				{data?.length === 0 && "Your invites will appear here."}
				{data && data.length > 0 && (
					<ul className="space-y-2">
						{data.map((invite) => (
							<li key={invite.listId} className="card shadow-md p-4">
								<p>
									<span className="font-semibold mr-2">List ID:</span>
									{invite.listId}
								</p>
								<p>
									<span className="font-semibold mr-2">User:</span>
									{invite.invitedUserEmail}
								</p>
								<p>
									<span className="font-semibold mr-2">Accepted:</span>
									{invite.accepted ? "Accepted ✅" : "Awaiting acceptance ⏳"}
								</p>
							</li>
						))}
					</ul>
				)}
			</div>
		</>
	);
};

export default ListSentInvites;
