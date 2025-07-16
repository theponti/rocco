import { UserCircle } from "lucide-react";
import { useCallback } from "react";
import { useNavigate } from "react-router";
import Alert from "~/components/alert";
import { LoadingScreen } from "~/components/loading";
import { Button } from "~/components/ui/button";
import { trpc } from "~/lib/trpc/client";
import { requireAuth } from "~/routes/guards";
import type { Route } from "./+types/account";

export async function loader(args: Route.LoaderArgs) {
	const authResult = await requireAuth(args);

	if (authResult instanceof Response) {
		return authResult;
	}

	return { user: authResult.user };
}

function MemberSince({ createdAt }: { createdAt: string }) {
	const memberSince = new Date(createdAt);
	const timeDiff = new Date().getTime() - memberSince.getTime();
	// Convert milliseconds to years
	const years = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 365));
	const month = memberSince.getMonth();
	const year = `${memberSince.getFullYear() + years}`;

	return `Member since ${month}/${year}`;
}

function DeleteAccount() {
	const navigate = useNavigate();
	const { isPending, isError, mutate } = trpc.user.deleteAccount.useMutation({
		onSuccess: () => {
			return navigate("/login");
		},
	});

	const onSubmit = useCallback(
		(e: React.FormEvent<HTMLFormElement>) => {
			e.preventDefault();
			mutate();
		},
		[mutate],
	);

	return (
		<>
			{isError && (
				<Alert type="error">
					<span data-testid="delete-account-error">
						There was an error deleting your account. Please try again.
					</span>
				</Alert>
			)}

			<form onSubmit={onSubmit}>
				<Button
					data-testid="delete-account-form"
					className="px-4 py-2"
					type="submit"
					variant="destructive"
				>
					Delete account
				</Button>
			</form>
		</>
	);
}

export default function Account({ loaderData }: Route.ComponentProps) {
	const { user } = loaderData;

	return (
		<div className="flex flex-col w-full">
			<div className="col-span-12">
				<h1 className="text-2xl font-semibold mb-4">Account</h1>
				<div className="border border-gray-200 rounded-lg shadow-md md:max-w-sm p-4 flex flex-row justify-between items-center">
					{user.user_metadata.image || user.user_metadata.picture ? (
						<img
							src={user.user_metadata.image || user.user_metadata.picture || ""}
							alt="user avatar"
							className="rounded-circle img-fluid profile-picture"
						/>
					) : (
						<UserCircle data-testid="user-circle-icon" size={64} />
					)}
					<div className="flex flex-col">
						<p className="text-lg text-right w-full px-1 h-fit">
							{user.user_metadata.name}
						</p>
						<p className="text-sm text-black text-right w-full px-1 h-fit">
							{user.email}
						</p>
						<p className="text-sm text-black text-right w-full px-1 h-fit">
							<MemberSince createdAt={user.created_at} />
						</p>
					</div>
				</div>
				<div className="flex flex-col mb-8" />

				<DeleteAccount />
			</div>
		</div>
	);
}

export function ErrorBoundary({ error }: { error: unknown }) {
	console.error(error);
	return <Alert type="error">An unexpected error occurred.</Alert>;
}

export function HydrateFallback() {
	return <LoadingScreen />;
}
