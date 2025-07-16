import React, { useCallback } from "react";

import { Button } from "~/components/ui/button";
import { useAcceptInviteMutation } from "~/lib/trpc/api";
import type { ExtendedListInvite } from "~/lib/types";

type ListInviteItemProps = {
	invite: ExtendedListInvite;
	onAcceptInvite: () => void;
};
function ListInviteItem({ invite, onAcceptInvite }: ListInviteItemProps) {
	const mutation = useAcceptInviteMutation();
	const acceptInvite = useCallback(async () => {
		await mutation.mutateAsync({
			listId: invite.listId,
			invitedUserEmail: invite.invitedUserEmail,
		});
		onAcceptInvite();
	}, [invite.listId, invite.invitedUserEmail, mutation, onAcceptInvite]);

	return (
		<li className="card shadow-md px-2 py-4 text-primary flex flex-row justify-between">
			<p
				className={`text-lg flex flex-col gap-2${
					invite.accepted ? "" : " text-gray-400"
				}`}
			>
				<span className="text-lg font-semibold">
					{invite.list?.name || "Unknown List"}
				</span>
				<span className="text-sm text-gray-400">
					{invite.user?.email || invite.invitedUserEmail}
				</span>
			</p>
			<div>
				{invite.accepted ? (
					<p className="text-md">✅ Accepted</p>
				) : (
					<Button
						className="btn-success btn-sm rounded-md"
						onClick={acceptInvite}
					>
						Accept
					</Button>
				)}
			</div>
		</li>
	);
}

export default React.memo(ListInviteItem);
