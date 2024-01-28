import { SyntheticEvent, useCallback, useState } from "react";
import { useMutation } from "react-query";
import AlertError from "ui/AlertError";
import Input from "ui/Input";

import { api, URLS } from "src/services/api/base";
import Button from "ui/Button";

const MIN_LENGTH = 3;

type ListFormProps = {
  onCreate: () => void;
};
export default function ListForm({ onCreate }: ListFormProps) {
  const [name, setName] = useState("");
  const { error, isLoading, mutate } = useMutation({
    mutationFn: async (e: SyntheticEvent<HTMLFormElement>) => {
      e.preventDefault();
      return api.post(URLS.lists, {
        name,
      });
    },
    onSuccess: () => {
      setName("");
      onCreate();
    },
  });
  const onNameChange = useCallback(
    (e: SyntheticEvent<HTMLInputElement>) => {
      setName(e.currentTarget.value);
    },
    [setName],
  );

  return (
    <>
      {error && <AlertError error={error as string} />}

      <form onSubmit={mutate}>
        <Input
          name="listName"
          type="text"
          label="List name"
          onChange={onNameChange}
          value={name}
        />
        {name.length > MIN_LENGTH ? (
          <Button className="float-right px-12" isLoading={isLoading}>
            Submit
          </Button>
        ) : null}
      </form>
    </>
  );
}
