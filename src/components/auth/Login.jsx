import React from "react";
import { useFormik } from "formik";
import { LockKeyhole } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { clearLoginFeedback, loginUser } from "../../redux/slices/authSlice";
import { loginValidationSchema } from "./authValidation";

export default function Login({ notice, onShowSignup }) {
  const dispatch = useDispatch();
  const { loginStatus, loginError } = useSelector((state) => state.auth);
  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: loginValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      await dispatch(
        loginUser({ email: values.email.trim(), password: values.password }),
      );
      setSubmitting(false);
    },
  });
  const loading = loginStatus === "loading" || formik.isSubmitting;

  const update = (event) => {
    formik.handleChange(event);
    if (loginError) dispatch(clearLoginFeedback());
  };
  return (
    <main className="login-page">
      <section className="login-story">
        <div className="login-brand">
          <span>DH</span>
          <b>
            DIGITAL HEROES<small>PRODUCTION STUDIO</small>
          </b>
        </div>
        <div className="story-copy">
          <p>ADMIN OPERATIONS</p>
          <h1>From first quote to final print.</h1>
          <span>
            Manage artwork, approvals and production from one clear workspace.
          </span>
        </div>
        <div className="story-flow">
          <span>Quote</span>
          <i />
          <span>Proof</span>
          <i />
          <span>Production</span>
          <i />
          <span>Complete</span>
        </div>
      </section>
      <section className="login-panel">
        <form onSubmit={formik.handleSubmit} noValidate>
          <div className="login-mark">
            <LockKeyhole />
          </div>
          <p>ADMIN PORTAL</p>
          <h2>Welcome back.</h2>
          <span>Sign in to manage studio production.</span>
          {notice && (
            <div className="form-success" role="status">
              {notice}
            </div>
          )}
          <label>
            Email address
            <input
              name="email"
              value={formik.values.email}
              onChange={update}
              onBlur={formik.handleBlur}
              type="email"
              autoComplete="email"
              disabled={loading}
              aria-invalid={
                formik.touched.email && Boolean(formik.errors.email)
              }
              aria-describedby="login-email-error"
            />
            {formik.touched.email && formik.errors.email && (
              <small className="field-error" id="login-email-error">
                {formik.errors.email}
              </small>
            )}
          </label>
          <label>
            Password
            <input
              name="password"
              value={formik.values.password}
              onChange={update}
              onBlur={formik.handleBlur}
              type="password"
              autoComplete="current-password"
              disabled={loading}
              aria-invalid={
                formik.touched.password && Boolean(formik.errors.password)
              }
              aria-describedby="login-password-error"
            />
            {formik.touched.password && formik.errors.password && (
              <small className="field-error" id="login-password-error">
                {formik.errors.password}
              </small>
            )}
          </label>
          {loginError && (
            <div className="form-error" role="alert">
              {loginError}
            </div>
          )}
          <button
            className="primary-button login-button"
            type="submit"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
          {/* <div className="auth-switch">
            New to Digital Heroes?{" "}
            <button type="button" onClick={onShowSignup} disabled={loading}>
              Create an account
            </button>
          </div> */}
        </form>
      </section>
    </main>
  );
}
