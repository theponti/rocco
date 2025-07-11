import { useMutation } from "@tanstack/react-query";
import type { SyntheticEvent } from "react";
import { useCallback, useState } from "react";
import { type CreateListInvite, createListInvite } from "~/lib/api";

type UseListInviteFormProps = {
	onCreate: () => void;
};
export default function useListInviteForm({
	onCreate,
}: UseListInviteFormProps) {
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState<boolean>();
	const [error, setError] = useState<string | undefined>();

	const onNameChange = useCallback((e: SyntheticEvent<HTMLInputElement>) => {
		setEmail(e.currentTarget.value);
		setError(undefined);
	}, []);

	const mutation = useMutation({
		mutationFn: async (args: CreateListInvite) => {
			const res = await createListInvite(args);
			return res.data;
		},
		onSuccess: onCreate,
		onError: (err) => {
			if (err instanceof Error) {
				setError(err.message);
			} else {
				setError("An unknown error occurred");
			}
		},
	});

	return {
		error,
		mutation,
		email,
		createListInvite,
		onNameChange,
	};
}
