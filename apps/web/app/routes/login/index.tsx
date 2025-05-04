import AuthWrap from "app/components/AuthenticationWrap";
import { useFormik } from "formik";
import { Globe } from "lucide-react";
import { useFetcher, useSearchParams } from "react-router";
import * as Yup from "yup";
import Alert from "~/components/Alert";
import Button from "~/components/Button";
import { requireGuest } from "~/routes/guards";
import type { Route } from "./+types";

export async function loader({ request }: Route.LoaderArgs) {
	// Use our new guard utility
	await requireGuest(request);

	// Get the redirect URL from the search params (if any)
	const url = new URL(request.url);
	const redirectTo = url.searchParams.get("redirectTo") || "/dashboard";

	return { redirectTo };
}

const LoginSchema = Yup.object().shape({
	email: Yup.string().email().required("Email is required"),
});

type LoginForm = {
	email: string;
};

function Login() {
	const fetcher = useFetcher();
	const [searchParams] = useSearchParams();
	const redirectTo = searchParams.get("redirectTo") || "/dashboard";

	const form = useFormik<LoginForm>({
		initialValues: { email: "" },
		validationSchema: LoginSchema,
		onSubmit: (values) => {
			fetcher.submit({ ...values, redirectTo }, { method: "post" });
		},
	});

	return (
		<AuthWrap data-testid="login-page">
			<div className="flex justify-center text-primary font-extrabold mb-4 mt-24">
				<Globe size={150} className="animate-pulse" />
			</div>
			<fetcher.Form
				method="post"
				className="w-full"
				onSubmit={form.handleSubmit}
			>
				<div className="form-control w-full">
					<label className="label pl-0" htmlFor="email">
						<span className="label-text">What is your email?</span>
					</label>
					<input
						{...form.getFieldProps("email")}
						data-testid="email-input"
						className="input input-bordered w-full"
						type="email"
						placeholder="Email"
					/>
				</div>
				<Button
					data-testid="login-button"
					type="submit"
					className="w-full mt-4"
					isLoading={fetcher.state === "submitting"}
				>
					Get code
				</Button>
				{fetcher.data?.error && (
					<Alert type="error">
						<p className="mb-1">There was an issue logging you in.</p>
						<p className="text-sm">
							Our engineers are working on it. Please, try again later.
						</p>
					</Alert>
				)}
			</fetcher.Form>
		</AuthWrap>
	);
}

// Export the component directly, authorization is handled in the loader
export default Login;
