import { eq } from "drizzle-orm";
import { useLoaderData } from "react-router";
import VoteScreen from "~/components/voter/VoteScreen";
import { db } from "~/db";
import { trackers, votes } from "~/db/schema";
import type { Route } from "../../../+types/root";

export const loader = async (loaderData: Route.LoaderArgs) => {
	const trackerId = loaderData.params.trackerId;
	if (!trackerId) throw new Response("Missing trackerId", { status: 400 });

	const tracker = await db.query.trackers.findFirst({
		where: eq(trackers.id, trackerId),
	});
	if (!tracker) throw new Response("Not found", { status: 404 });

	const trackerVotes = await db.query.votes.findMany({
		where: eq(votes.trackerId, trackerId),
	});

	return { tracker, votes: trackerVotes };
};

export default function TrackerVoteRoute() {
	const { tracker, votes } = useLoaderData<typeof loader>();
	// You will need to provide onBack and onVoteCasted handlers
	return (
		<VoteScreen
			tracker={tracker}
			votes={votes}
			onBack={() => {}}
			onVoteCasted={() => {}}
		/>
	);
}
