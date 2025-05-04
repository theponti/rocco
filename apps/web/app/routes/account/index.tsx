import { UserCircle } from "lucide-react";
import Alert from "~/components/Alert";
import Button from "~/components/Button";

import { api, baseURL } from "app/lib/api/base"; // Added
import type { User } from "app/lib/types"; // Added
import { redirect, useFetcher, useLoaderData } from "react-router";

// Loader function to fetch user data
export async function loader({ request }: { request: Request }) {
	// Placeholder: Replace with actual Clerk auth check for loaders
	const isAuthenticated = true; // Replace with actual check
	if (!isAuthenticated) {
		return redirect("/login");
	}

	try {
		const res = await api.get<User>(`${baseURL}/user`);
		return { user: res.data };
	} catch (error) {
		console.error("Failed to fetch user data:", error);
		throw new Response("Could not load account data.", { status: 500 });
	}
}

// Action function to handle account deletion
export async function action({ request }: { request: Request }) {
	try {
		await api.delete(`${baseURL}/user`);
		return redirect("/login");
	} catch (error) {
		console.error("Failed to delete account:", error);
		throw new Response("Could not delete account.", { status: 500 });
	}
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
	const fetcher = useFetcher();

	return (
		<>
			{fetcher.data?.error && (
				<Alert type="error">{fetcher.data.error.message}</Alert>
			)}

			<fetcher.Form method="post">
				<Button
					className="btn-ghost border-red-400 text-error min-h-fit h-fit px-4 py-2"
					type="submit"
				>
					Delete account
				</Button>
			</fetcher.Form>
		</>
	);
}

function Account() {
	const { user } = useLoaderData() as { user: User }; // Use data from loader

	return (
		<div className="flex flex-col w-full">
			<div className="col-span-12">
				<h1 className="text-2xl font-semibold mb-4">Account</h1>
				<div className="card shadow-md md:max-w-sm">
					<div className="card-body bg-slate-100 rounded-lg bg-gradient-to-br from-[#d7e9ff] to-[#ff94b7]">
						{user.avatar ? (
							<img
								src={user.avatar}
								alt="user avatar"
								className="rounded-circle img-fluid profile-picture mb-3 mb-md-0"
							/>
						) : (
							<UserCircle size={64} />
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

export default Account;

// ErrorBoundary to handle errors
export function ErrorBoundary({ error }: { error: unknown }) {
	console.error(error);
	return <Alert type="error">An unexpected error occurred.</Alert>;
}
