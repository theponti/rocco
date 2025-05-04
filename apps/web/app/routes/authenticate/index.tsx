import AuthWrap from "app/components/AuthenticationWrap";
import api from "app/lib/api";
import { queryClient } from "app/lib/api/base";
import { Link, useFetcher } from "react-router";
import Alert from "~/components/Alert";
import Button from "~/components/Button";

export async function action({ request }: { request: Request }) {
	const formData = await request.formData();
	const emailToken = formData.get("emailToken") as string;
	const loginEmail = formData.get("loginEmail") as string;

	try {
		await api.post("/authenticate", { email: loginEmail, emailToken });
		queryClient.invalidateQueries({ queryKey: ["auth/me"] });
		return null;
	} catch (error) {
		console.error("Authentication failed:", error);
		throw new Response("Invalid authentication code.", { status: 401 });
	}
}

function Authenticate({ loginEmail }: { loginEmail: string }) {
	const fetcher = useFetcher();

	if (!loginEmail) {
		return null;
	}

	return (
		<AuthWrap>
			<h2 className="text-2xl font-semibold mb-6">Authenticate</h2>
			{fetcher.data?.error && (
				<Alert className="mt-2" type="error">
					There was an issue validating your code.
					<button
						type="button"
						className="text-blue-500 block underline"
						onClick={() => fetcher.submit({ loginEmail }, { method: "post" })}
					>
						Try logging in again.
					</button>
				</Alert>
			)}
			<fetcher.Form method="post" className="w-full">
				<input type="hidden" name="loginEmail" value={loginEmail} />
				<div className="form-control w-full">
					<label className="label" htmlFor="emailToken">
						<span className="label-text">Enter code sent to your email.</span>
					</label>
					<input
						type="string"
						name="emailToken"
						className="input input-bordered"
						placeholder="Code"
					/>
					{fetcher.data?.error && (
						<Alert className="mt-2" type="error">
							<div className="flex flex-col gap-2 text-white">
								<p>Invalid code.</p>
								<p>
									<Link to="/login" className="underline">
										Request a new one.
									</Link>
								</p>
							</div>
						</Alert>
					)}
				</div>
				<Button
					type="submit"
					isLoading={fetcher.state === "submitting"}
					className="w-full mt-4"
				>
					Login
				</Button>
			</fetcher.Form>
			<div className="mt-4 text-center">
				<button
					type="button"
					className="underline"
					onClick={() => fetcher.submit({}, { method: "post" })}
				>
					Get new code
				</button>
			</div>
		</AuthWrap>
	);
}

export default Authenticate;
