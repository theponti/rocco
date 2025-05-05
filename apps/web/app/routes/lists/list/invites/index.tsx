import Alert from "app/components/Alert";
import ListInviteForm from "app/components/ListInviteForm";
import { LoadingScreen } from "app/components/Loading";
import { getList, useGetListInvites } from "app/lib/api";
import { useCallback } from "react";
import { Link, useParams } from "react-router";
import type { Route } from "./+types";

export async function clientLoader({ params }: Route.ClientActionArgs) {
	const list = await getList(params.id);
	return { list };
}

export default function ListInvites({ loaderData }: Route.ComponentProps) {
	const params = useParams();
	const { list } = loaderData;
	const listId = list.id;
	const {
		data: listInvites,
		status: invitesStatus,
		refetch: getInvites,
		...listInvitesQuery
	} = useGetListInvites(listId);
	const onInviteSuccess = useCallback(() => getInvites(), [getInvites]);

	if (listInvitesQuery.isPending) {
		return <LoadingScreen />;
	}

	if (!list || !listInvites) {
		return <Alert type="error">We could not find this list.</Alert>;
	}

	return (
		<>
			<div className="flex flex-col px-0.5">
				<h1 className="text-2xl">
					<Link to={`/list/${list.id}`}>
						<span className="font-extrabold text-4xl mr-4">{list.name}</span>
					</Link>
					<span className="text-primary-focus">Invites</span>
				</h1>
			</div>
			<ListInviteForm listId={listId} onCreate={onInviteSuccess} />
			{listInvites.length > 0 ? (
				<ul className="space-y-4">
					{listInvites.map(({ accepted, invitedUserEmail }) => (
						<li
							key={invitedUserEmail}
							className="p-4 text-lg flex flex-row justify-between border-2 border-gray-100 rounded-md"
						>
							<p className="text-sm text-gray-400">{invitedUserEmail}</p>
							{accepted ? (
								<span className="text-sm">✅ Accepted</span>
							) : (
								<span className="text-sm">⏳ Pending</span>
							)}
						</li>
					))}
				</ul>
			) : (
				<p className="text-lg flex justify-center p-4 font-semibold">
					You haven&apos;t invited anyone to this list.
				</p>
			)}
		</>
	);
}
