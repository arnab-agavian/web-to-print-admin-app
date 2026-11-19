import React from 'react';
import { useFormik } from 'formik';
import { UserPlus } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { clearSignupFeedback, signupUser } from '../../redux/slices/authSlice';
import { signupValidationSchema } from './authValidation';

const initialValues = {
  fullName: '',
  phone: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptedTerms: false,
};

export default function Signup({ onSignupSuccess, onShowLogin }) {
  const dispatch = useDispatch();
  const { signupStatus, signupError } = useSelector((state) => state.auth);
  const formik = useFormik({
    initialValues,
    validationSchema: signupValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      const action = await dispatch(signupUser({
        email: values.email.trim(),
        password: values.password,
        fullName: values.fullName.trim(),
        phone: values.phone.trim(),
        role: 'admin',
      }));
      setSubmitting(false);
      if (signupUser.fulfilled.match(action)) onSignupSuccess(action.payload);
    },
  });
  const loading = signupStatus === 'loading' || formik.isSubmitting;

  const update = (event) => {
    formik.handleChange(event);
    if (signupError) dispatch(clearSignupFeedback());
  };

  const fieldError = (name, id) => formik.touched[name] && formik.errors[name]
    ? <small className="field-error" id={id}>{formik.errors[name]}</small>
    : null;

  return (
    <main className="login-page signup-page">
      <section className="login-story">
        <div className="login-brand"><span>DH</span><b>DIGITAL HEROES<small>PRODUCTION STUDIO</small></b></div>
        <div className="story-copy"><p>TEAM ACCESS</p><h1>Build a smoother print operation.</h1><span>Bring quotes, artwork, approvals and production together for your whole studio.</span></div>
        <div className="story-flow"><span>Invite</span><i /><span>Quote</span><i /><span>Approve</span><i /><span>Deliver</span></div>
      </section>
      <section className="login-panel signup-panel">
        <form onSubmit={formik.handleSubmit} noValidate>
          <div className="login-mark"><UserPlus /></div>
          <p>CREATE ACCOUNT</p>
          <h2>Join the studio.</h2>
          <span>Set up your production workspace in a minute.</span>
          <div className="signup-fields">
            <label>Full name<input name="fullName" value={formik.values.fullName} onChange={update} onBlur={formik.handleBlur} type="text" autoComplete="name" placeholder="Maya Brooks" disabled={loading} aria-invalid={formik.touched.fullName && Boolean(formik.errors.fullName)} aria-describedby="signup-name-error" />{fieldError('fullName', 'signup-name-error')}</label>
            <label>Phone number<input name="phone" value={formik.values.phone} onChange={update} onBlur={formik.handleBlur} type="tel" autoComplete="tel" placeholder="+1 919 876 5432" disabled={loading} aria-invalid={formik.touched.phone && Boolean(formik.errors.phone)} aria-describedby="signup-phone-error" />{fieldError('phone', 'signup-phone-error')}</label>
          </div>
          <label>Email address<input name="email" value={formik.values.email} onChange={update} onBlur={formik.handleBlur} type="email" autoComplete="email" placeholder="maya@example.com" disabled={loading} aria-invalid={formik.touched.email && Boolean(formik.errors.email)} aria-describedby="signup-email-error" />{fieldError('email', 'signup-email-error')}</label>
          <div className="signup-fields">
            <label>Password<input name="password" value={formik.values.password} onChange={update} onBlur={formik.handleBlur} type="password" autoComplete="new-password" disabled={loading} aria-invalid={formik.touched.password && Boolean(formik.errors.password)} aria-describedby="signup-password-error" />{fieldError('password', 'signup-password-error')}</label>
            <label>Confirm password<input name="confirmPassword" value={formik.values.confirmPassword} onChange={update} onBlur={formik.handleBlur} type="password" autoComplete="new-password" disabled={loading} aria-invalid={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)} aria-describedby="signup-confirm-error" />{fieldError('confirmPassword', 'signup-confirm-error')}</label>
          </div>
          <p className="password-hint">8+ characters with a capital letter and a number.</p>
          <label className="terms-check"><input name="acceptedTerms" checked={formik.values.acceptedTerms} onChange={update} onBlur={formik.handleBlur} type="checkbox" disabled={loading} aria-invalid={formik.touched.acceptedTerms && Boolean(formik.errors.acceptedTerms)} aria-describedby="signup-terms-error" /><span>I agree to the terms of service and privacy policy.</span></label>
          {fieldError('acceptedTerms', 'signup-terms-error')}
          {signupError && <div className="form-error" role="alert">{signupError}</div>}
          <button className="primary-button login-button" type="submit" disabled={loading} aria-busy={loading}>{loading ? 'Creating account…' : 'Create account'}</button>
          <div className="auth-switch">Already have an account? <button type="button" onClick={onShowLogin} disabled={loading}>Sign in</button></div>
        </form>
      </section>
    </main>
  );
}
