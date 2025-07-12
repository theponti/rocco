import { UserCircle } from "lucide-react";
import { useCallback } from "react";
import { redirect, useLoaderData, useNavigate } from "react-router";
import Alert from "~/components/alert";
import { LoadingScreen } from "~/components/loading";
import { Button } from "~/components/ui/button";
import { useUser } from "~/lib/auth-provider";
import { trpc } from "~/lib/trpc/client";
import type { User } from "~/lib/types";

export async function loader() {
	const { user } = useUser();
	if (!user) {
		return redirect("/login");
	}

	// For now, return the user from auth provider
	// In a real app, you might want to fetch additional user data from the database
	return { user };
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
					className="btn-ghost border-red-400 text-error min-h-fit h-fit px-4 py-2"
					type="submit"
				>
					Delete account
				</Button>
			</form>
		</>
	);
}

export default function Account() {
	const { user } = useLoaderData<{ user: User }>();

	return (
		<div className="flex flex-col w-full">
			<div className="col-span-12">
				<h1 className="text-2xl font-semibold mb-4">Account</h1>
				<div className="card shadow-md md:max-w-sm">
					<div className="card-body bg-slate-100 rounded-lg bg-gradient-to-br from-[#d7e9ff] to-[#ff94b7]">
						{user.image || user.photoUrl ? (
							<img
								src={user.image || user.photoUrl || ""}
								alt="user avatar"
								className="rounded-circle img-fluid profile-picture mb-3 mb-md-0"
							/>
						) : (
							<UserCircle data-testid="user-circle-icon" size={64} />
						)}
						<p className="text-lg text-right w-full px-1 h-fit">{user?.name}</p>
						<p className="text-sm text-black text-right w-full px-1 h-fit">
							{user?.email}
						</p>
						<p className="text-sm text-black text-right w-full px-1 h-fit">
							<MemberSince createdAt={user.createdAt} />
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
