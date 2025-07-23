import Lists from "~/components/lists-components/lists";
import { requireAuth } from "~/routes/guards";

export async function loader(loaderArgs: any) {
	const response = await requireAuth(loaderArgs);

	if ("getToken" in response) {
		// For now, return empty data and let the client fetch with tRPC
		return {
			lists: [],
		};
	}
}

function Dashboard() {
	return (
		<div
			className="flex flex-col gap-4 w-full h-full pb-8"
			data-testid="dashboard-scene"
		>
			<Lists />
		</div>
	);
}

export function ErrorBoundary(errorArgs: any) {
	return (
		<div className="flex flex-col items-center justify-center h-full text-gray-900">
			<h2>Something went wrong while loading the dashboard.</h2>
			<p>Please try again later.</p>
		</div>
	);
}

export default Dashboard;
