import classNames from "classnames";
import { type SyntheticEvent, useCallback } from "react";
import FeedbackBlock from "ui/FeedbackBlock";

import useIdeaForm from "./useIdeasForm";

type IdeaFormProps = {
	onCreate: () => void;
};
export default function IdeaForm({ onCreate }: IdeaFormProps) {
	const { error, description, isLoading, createIdea, onDescriptionChange } =
		useIdeaForm({
			onCreate,
		});

	const onFormSubmit = useCallback(
		(e: SyntheticEvent<HTMLFormElement>) => {
			e.preventDefault();
			createIdea();
		},
		[createIdea],
	);

	return (
		<>
			{error && <FeedbackBlock type="error">{error}</FeedbackBlock>}

			<form onSubmit={onFormSubmit}>
				<div className="form-control w-full mb-2">
					<label className="label hidden">
						<span className="label-text">Description</span>
					</label>
					<textarea
						placeholder="What's happening?"
						className="textarea w-full text-lg p-2 border-stone-300 rounded placeholder:text-zinc-400"
						value={description}
						onChange={onDescriptionChange}
					/>
				</div>
				{!!description.length && (
					<button
						type="submit"
						className={classNames(
							"btn btn-primary float-right min-w-full mb-4",
							isLoading && "loading",
						)}
					>
						Submit
					</button>
				)}
			</form>
		</>
	);
}
