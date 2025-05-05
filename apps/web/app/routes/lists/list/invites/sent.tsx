import { useAuth } from "@clerk/react-router";
import AppLink from "app/components/AppLink";
import { useGetOutboundInvites } from "app/lib/api";
import { useNavigate } from "react-router";

export async function clientLoader() {
	const response = await fetch("/api/invites/outbound");
	const outboundInvites = await response.json();
	return { outboundInvites };
}

const ListSentInvites = ({
	loaderData,
}: { loaderData: { outboundInvites: any[] } }) => {
	const navigate = useNavigate();
	const { userId } = useAuth();
	const { outboundInvites: data } = loaderData;

	if (userId) {
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
									<span className="font-semibold mr-2">List:</span>
									{invite.list.name}
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
