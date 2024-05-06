import Alert from "@hominem/components/Alert";
import Button from "@hominem/components/Button";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { Field, Formik } from "formik";
import { Globe } from "lucide-react";
import { useCallback, useEffect, useMemo } from "react";
import { useMutation } from "react-query";
import * as Yup from "yup";

import AuthWrap from "src/components/AuthenticationWrap";
import Form from "src/components/Form";
import { useAuth } from "src/services/auth";
import { LANDING } from "src/services/constants/routes";

const LoginSchema = Yup.object().shape({
	email: Yup.string().email(),
});

function Login() {
	const { user, login } = useAuth();
	const navigate = useNavigate();
	const initialValues = useMemo(
		() => ({
			email: "",
		}),
		[],
	);

	const { mutateAsync, isLoading, isError } = useMutation({
		mutationFn: async ({ email }: { email: string }) => login(email),
		onSuccess: () => {
			navigate({ to: "/authenticate" });
		},
	});

	const onSubmit = useCallback(
		(values) => {
			mutateAsync(values);
		},
		[mutateAsync],
	);

	useEffect(() => {
		if (user) {
			navigate({ to: LANDING });
		}
	});

	return (
		<AuthWrap data-testid="login-page">
			<div className="flex justify-center text-primary font-extrabold mb-4 mt-24">
				<Globe size={150} className="animate-pulse" />
			</div>
			<h2 className="text-2xl font-semibold mb-6">Log in</h2>
			<Formik
				validationSchema={LoginSchema}
				initialValues={initialValues}
				onSubmit={onSubmit}
			>
				<Form>
					<div className="form-control w-full">
						<label className="label pl-0" htmlFor="email">
							<span className="label-text">What is your email?</span>
						</label>
						<Field
							className="input input-bordered w-full font-semibold"
							name="email"
							type="email"
							placeholder="Email"
						/>
					</div>
					<Button isLoading={isLoading}>Get code</Button>
					{isError && (
						<Alert type="error">
							<p className="mb-1">
								We ran into an issue finding or creating your account.
							</p>
							<p>Please, try again later</p>
						</Alert>
					)}
				</Form>
			</Formik>
		</AuthWrap>
	);
}

export const Route = createLazyFileRoute("/login")({
	component: Login,
});
