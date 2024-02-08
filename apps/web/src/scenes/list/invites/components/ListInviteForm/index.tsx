import { validateYupSchema } from "formik";
import styled from "@emotion/styled";
import { AxiosError } from "axios";
import { SyntheticEvent, useCallback, useState } from "react";
import AlertError from "ui/AlertError";
import Input from "ui/Input";
import Button from "ui/Button";
import * as Yup from "yup";

import { useCreateListInvite } from "src/services/api";
import { ListInvite } from "src/services/types";

const Form = styled.form`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
`;

const InviteSchema = Yup.object().shape({
  email: Yup.string().email(),
});

type ListInviteFormProps = {
  listId: string;
  onCreate: (invite: ListInvite) => void;
};
export default function ListInviteForm({
  listId,
  onCreate,
}: ListInviteFormProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const {
    error,
    isLoading,
    mutateAsync: createListInvite,
  } = useCreateListInvite({
    onSuccess: (data) => {
      onCreate(data);
      setEmail("");
    },
  });

  const onFormSubmit = useCallback(
    async (e: SyntheticEvent<HTMLFormElement>) => {
      e.preventDefault();
      validateYupSchema({ email }, InviteSchema)
        .catch((err) => {
          setFormError(err.errors[0]);
        })
        .then(() => {
          createListInvite({ email, id: listId });
        });
    },
    [createListInvite, email, listId],
  );

  const onEmailChange = useCallback(
    (e: SyntheticEvent<HTMLInputElement>) => {
      setEmail(e.currentTarget.value);
    },
    [setEmail],
  );

  return (
    <div className="mb-4">
      <div className="my-4">
        {formError && <AlertError error={formError} />}
        {error && <AlertError error={(error as AxiosError).message} />}
      </div>
      <Form onSubmit={onFormSubmit}>
        <Input
          id="email"
          type="email"
          name="email"
          label="Email address"
          value={email}
          onChange={onEmailChange}
        />

        <Button
          className="float-right mt-4"
          disabled={email.length === 0}
          isLoading={isLoading}
        >
          Submit
        </Button>
      </Form>
    </div>
  );
}
