import { SyntheticEvent, useCallback, useState } from "react";

import AlertError from "ui/AlertError";
import Button from "ui/Button";

import { useCreateBookmark } from "src/services/api/bookmarks";

type BookmarksFormProps = {
  onCreate: () => void;
};
export default function BookmarksForm({ onCreate }: BookmarksFormProps) {
  const mutation = useCreateBookmark();
  const [url, setUrl] = useState("");

  const onUrlChange = useCallback((e: SyntheticEvent<HTMLInputElement>) => {
    setUrl(e.currentTarget.value);
  }, []);

  const onFormSubmit = useCallback(
    async (e: SyntheticEvent<HTMLFormElement>) => {
      e.preventDefault();
      await mutation.mutateAsync(url);
      setUrl("");
      onCreate();
    },
    [mutation, onCreate, url],
  );

  return (
    <>
      {mutation.error && <AlertError error={mutation.error as string} />}

      <form onSubmit={onFormSubmit}>
        <div className="form-control w-full mb-2">
          <label className="label hidden" htmlFor="url">
            <span className="label-text">URL</span>
          </label>
          <input
            id="url"
            type="url"
            placeholder="Add bookmark url"
            className="input w-full text-lg p-2 border-stone-300 rounded placeholder:text-zinc-400"
            value={url}
            onChange={onUrlChange}
          />
        </div>
        {!!url.length && <Button loading={mutation.isLoading}>Submit</Button>}
      </form>
    </>
  );
}
