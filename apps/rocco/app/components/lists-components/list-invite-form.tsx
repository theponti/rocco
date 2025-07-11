import { type SyntheticEvent, useCallback } from "react";
import Alert from "~/components/alert";
import Input from "~/components/input";
import { Button } from "~/components/ui/button";

import type { ListInvite } from "~/lib/types";
import styles from "./list-invite-form.module.css";
import useListInviteForm from "./use-list-invite-form";

type ListInviteFormProps = {
	listId: string;
	onCreate: (invite: ListInvite) => void;
};

export default function ListInviteForm({
	listId,
	onCreate,
}: ListInviteFormProps) {
	const { error, mutation, email, createListInvite, onNameChange } =
		useListInviteForm({
			onCreate: () => {
				onCreate({} as ListInvite);
			},
		});

	const onFormSubmit = useCallback(
		async (e: SyntheticEvent<HTMLFormElement>) => {
			e.preventDefault();
			await createListInvite({ id: listId, email });
		},
		[email, createListInvite, listId],
	);

	return (
		<div className="mb-4">
			{error && <Alert type="error">{error}</Alert>}
			<form className={styles.form} onSubmit={onFormSubmit}>
				<Input
					id="email"
					type="email"
					name="email"
					label="Email address"
					value={email}
					onChange={onNameChange}
				/>

				<Button
					className="float-right mt-4"
					disabled={email.length === 0}
					variant="outline"
				>
					{mutation.isPending ? "Submitting..." : "Submit"}
				</Button>
			</form>
		</div>
	);
}
