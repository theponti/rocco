import { useMutation } from "@tanstack/react-query";
import type { SyntheticEvent } from "react";
import { useCallback, useState } from "react";
import { trpc } from "~/lib/trpc/client";

type UseListInviteFormProps = {
	listId: string;
	onCreate?: () => void;
};

export default function useListInviteForm({
	listId,
	onCreate,
}: UseListInviteFormProps) {
	const [email, setEmail] = useState("");

	const mutation = trpc.invites.create.useMutation({
		onSuccess: () => {
			setEmail("");
			onCreate?.();
		},
	});

	const onNameChange = useCallback((e: SyntheticEvent<HTMLInputElement>) => {
		setEmail(e.currentTarget.value);
	}, []);

	const createListInvite = useCallback(
		async (email: string) => {
			mutation.mutate({
				listId,
				invitedUserEmail: email,
			});
		},
		[listId, mutation],
	);

	return {
		mutation,
		email,
		createListInvite,
		onNameChange,
	};
}
