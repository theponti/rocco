import { Field, Formik } from "formik";
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import * as Yup from "yup";

import AuthWrap from "src/components/AuthenticationWrap";
import FeedbackBlock from "src/components/FeedbackBlock";
import Form from "src/components/Form";
import { DASHBOARD } from "src/constants/routes";
import { loadAuth, setCurrentEmail } from "src/services/auth";
import { getLoginEmail } from "src/services/store";
import { authenticate } from "src/services/auth/auth.api";
import { FormButton } from "src/components/Form/components";
import { useAppDispatch, useAppSelector } from "src/services/hooks";

const AuthenticateSchema = Yup.object().shape({
  emailToken: Yup.string().length(8),
});

function Authenticate() {
  const loginEmail = useAppSelector(getLoginEmail);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [error, setError] = useState<ReactNode | undefined>();
  const initialValues = useMemo(
    () => ({
      emailToken: "",
    }),
    [],
  );

  const onSubmit = useCallback(
    async ({ emailToken }) => {
      if (loginEmail) {
        try {
          await authenticate({ email: loginEmail, emailToken });
          dispatch(loadAuth());
          dispatch(setCurrentEmail(null));
          navigate(DASHBOARD);
        } catch (err) {
          console.log({ err });
          if (err.response?.status === 401) {
            setError(
              <FeedbackBlock>
                Invalid code.
                <Link to="login"> Request a new one.</Link>
              </FeedbackBlock>,
            );
          } else {
            setError(err.response?.data?.message || "There was a problem.");
          }
        }
      }
    },
    [dispatch, navigate, loginEmail],
  );

  useEffect(() => {
    // If loginEmail is not set, user will need to request a new email token
    if (!loginEmail) {
      navigate("/login");
    }
  });

  if (!loginEmail) {
    return null;
  }

  return (
    <AuthWrap>
      <h2 className="text-2xl text-primary font-semibold mb-6">Authenticate</h2>
      {error && <FeedbackBlock>{error}</FeedbackBlock>}
      <Formik
        validationSchema={AuthenticateSchema}
        initialValues={initialValues}
        onSubmit={onSubmit}
      >
        <Form>
          <div className="form-control w-full">
            <label className="label" htmlFor="emailToken">
              <span className="label-text text-primary">
                Enter code sent to your email.
              </span>
            </label>
            <Field
              type="string"
              name="emailToken"
              label="Code"
              className="input input-bordered"
              placeholder="Code"
            />
          </div>
          <FormButton>Login</FormButton>
        </Form>
      </Formik>
    </AuthWrap>
  );
}

export default Authenticate;
