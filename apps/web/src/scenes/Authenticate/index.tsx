import { Field, Form, Formik } from "formik";
import PropTypes, { InferProps } from "prop-types";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { connect, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";

import FeedbackBlock from "src/components/FeedbackBlock";
import AuthWrap from "src/components/AuthenticationWrap";
import { ACCOUNT_PATH, LOGIN_PATH } from "src/constants/routes";
import { authSelectors, setCurrentEmail, setUser } from "src/services/auth";
import { authenticate, getUser } from "src/services/auth/auth.api";
import { RootState } from "src/services/store";

const AuthenticateSchema = Yup.object().shape({
  emailToken: Yup.string().length(8),
});

function Authenticate({
  loginEmail = "",
}: InferProps<typeof Authenticate.propTypes>) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState(false);
  const initialValues = useMemo(
    () => ({
      emailToken: "",
    }),
    []
  );

  const onSubmit = useCallback(async ({ emailToken }) => {
    if (loginEmail) {
      try {
        await authenticate({ email: loginEmail, emailToken });
        const response = await getUser();
        dispatch(setUser(response.data));
        dispatch(setCurrentEmail(null));
        navigate(ACCOUNT_PATH);
      } catch (err) {
        console.log({ err });
        setError(true);
        navigate(LOGIN_PATH);
      }
    }
  }, []);

  useEffect(() => {
    // If loginEmail is not set, user will need to request a new email token
    if (!loginEmail) {
      navigate("/login");
    }
  }, []);

  return (
    loginEmail && (
      <AuthWrap>
        <h2 className="text-2xl font-semibold mb-6">Authenticate</h2>
        {error && <FeedbackBlock>There was a problem, boo boo.</FeedbackBlock>}
        <Formik
          validationSchema={AuthenticateSchema}
          initialValues={initialValues}
          onSubmit={onSubmit}
        >
          <Form>
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">
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
            <button
              className="btn bg-blue-600 text-white border-none w-full"
              type="submit"
            >
              Log In
            </button>
          </Form>
        </Formik>
      </AuthWrap>
    )
  );
}

Authenticate.propTypes = {
  loginEmail: PropTypes.string,
  user: PropTypes.any,
};

const mapStateToProps = (state: RootState) => ({
  loginEmail: authSelectors.getLoginEmail(state),
  user: authSelectors.getUser(state),
});

export default connect(mapStateToProps)(Authenticate as React.FC);
