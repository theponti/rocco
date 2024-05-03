import Alert from "@hominem/components/Alert";
import Button from "@hominem/components/Button";
import { Link, createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { Field, Formik } from "formik";
import React, { useEffect, useMemo } from "react";
import { useMutation } from "react-query";
import * as Yup from "yup";

import AuthWrap from "src/components/AuthenticationWrap";
import Form from "src/components/Form";
import { loadAuth, setCurrentEmail } from "src/services/auth";
import { authenticate } from "src/services/auth/auth.api";
import { DASHBOARD, LOGIN } from "src/services/constants/routes";
import { getLoginEmail } from "src/services/hooks";
import { useAppDispatch, useAppSelector } from "src/services/store";

const AuthenticateSchema = Yup.object().shape({
	emailToken: Yup.string().length(8),
});

function Authenticate() {
	const loginEmail = useAppSelector(getLoginEmail);
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const initialValues = useMemo(
		() => ({
			emailToken: "",
		}),
		[],
	);
	const { mutateAsync, isLoading, isError, error } = useMutation<
		void,
		{ response: { message: string; status: number } },
		{ emailToken: string }
	>({
		mutationFn: async ({ emailToken }) => {
			await authenticate({ email: loginEmail, emailToken });
		},
		onSuccess: () => {
			dispatch(loadAuth());
			dispatch(setCurrentEmail(null));
			navigate({ to: DASHBOARD });
		},
	});

	const onSubmit = useMemo(
		() => (values) => {
			mutateAsync(values);
		},
		[mutateAsync],
	);

	useEffect(() => {
		// If loginEmail is not set, user will need to request a new email token
		if (!loginEmail) {
			navigate({ to: "/login" });
		}
	});

	if (!loginEmail) {
		return null;
	}

	return (
		<AuthWrap>
			<h2 className="text-2xl font-semibold mb-6">Authenticate</h2>
			<Formik
				validationSchema={AuthenticateSchema}
				initialValues={initialValues}
				onSubmit={onSubmit}
			>
				<Form>
					<div className="form-control w-full">
						<label className="label" htmlFor="emailToken">
							<span className="label-text">Enter code sent to your email.</span>
						</label>
						<Field
							type="string"
							name="emailToken"
							label="Code"
							className="input input-bordered"
							placeholder="Code"
						/>
						{isError && error.response?.status !== 401 && (
							<Alert className="mt-2" type="error">
								There was an issue validating your code.
								<Link to={LOGIN} className="text-blue-500">
									Try logging in again.
								</Link>
							</Alert>
						)}
						{isError && error.response?.status === 401 && (
							<Alert className="mt-2" type="info">
								<span>Invalid code.</span>
								<Link to={LOGIN} className="text-blue-500">
									Request a new one.
								</Link>
							</Alert>
						)}
					</div>
					<Button isLoading={isLoading}>Login</Button>
				</Form>
			</Formik>
		</AuthWrap>
	);
}

export const Route = createLazyFileRoute("/authenticate/")({
	component: Authenticate,
});
