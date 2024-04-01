import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useCallback, useEffect } from "react";
import FeedbackBlock from "ui/FeedbackBlock";

import LoadingScene from "src/components/Loading";
import { trpc } from "src/utils/trpc";

const Account = () => {
	const router = useRouter();
	const { data: session, status } = useSession();
	const pictureUrl = session?.user?.image as string;
	const deleteUser = trpc.auth.deleteUser.useMutation();
	const onDelectAccount = useCallback(async () => {
		await deleteUser.mutateAsync();
		signOut();
	}, [deleteUser]);

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/");
		}
	}, [router, status]);

	switch (status) {
		case "loading":
			return <LoadingScene />;
		case "unauthenticated":
			return <div />;
		default:
			break;
	}

	return (
		<>
			<div className="col-span-12">
				<h1>Account</h1>

				<div className="card shadow-md md:max-w-sm">
					<div className="card-body place-items-center">
						<Image
							alt="profile picture"
							src={pictureUrl.replace("_normal", "")}
							width={100}
							height={100}
							className="avatar rounded-full border-2 border-base-content w-28 h-28"
						/>
						<p className="text-lg">{session?.user?.name}</p>
						<p className="text-sm text-gray-400">{session?.user?.email}</p>
					</div>
				</div>

				<div className="divider" />

				{deleteUser.error && (
					<FeedbackBlock type="error">{deleteUser.error.message}</FeedbackBlock>
				)}

				<button
					type="button"
					className="btn btn-ghost text-error"
					onClick={onDelectAccount}
				>
					Delete account
				</button>
			</div>
		</>
	);
};

export default Account;
