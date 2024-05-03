import LoadingScene from "@hominem/components/Loading";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";

import IdeaForm from "src/components/IdeaForm";
import IdeaListItem from "src/components/IdeaListItem";
import { useGetIdeas } from "src/services/api/ideas";
import { useAuth } from "src/services/hooks";

const Ideas = () => {
	const navigate = useNavigate();
	const { user } = useAuth();
	const { data, refetch, status: ideasStatus } = useGetIdeas();

	if (!user) {
		navigate({ to: "/" });
	}

	return (
		<>
			<IdeaForm onCreate={refetch} />
			<div>
				{ideasStatus === "loading" && <LoadingScene />}
				{data?.length === 0 && "your thoughts will appear here"}
				{data && data.length > 0 && (
					<ul className="space-y-2">
						{data.map((idea) => (
							<IdeaListItem key={idea.id} idea={idea} onDelete={refetch} />
						))}
					</ul>
				)}
			</div>
		</>
	);
};

export const Route = createLazyFileRoute("/ideas/")({
	component: Ideas,
});
