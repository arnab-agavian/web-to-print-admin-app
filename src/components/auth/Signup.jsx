import React from 'react';
import { Checkbox, FormControlLabel } from '@mui/material';
import { useFormik } from 'formik';
import { UserPlus } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { clearSignupFeedback, signupUser } from '../../redux/slices/authSlice';
import { signupValidationSchema } from './authValidation';
import { AppTextField } from '../ui/AppFields';

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

  const fieldProps = (name) => ({
    name,
    value: formik.values[name],
    onChange: update,
    onBlur: formik.handleBlur,
    disabled: loading,
    error: formik.touched[name] && Boolean(formik.errors[name]),
    helperText: formik.touched[name] ? formik.errors[name] : '',
  });

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
            <AppTextField label="Full name" type="text" autoComplete="name" placeholder="Maya Brooks" {...fieldProps('fullName')} />
            <AppTextField label="Phone number" type="tel" autoComplete="tel" placeholder="+1 919 876 5432" {...fieldProps('phone')} />
          </div>
          <AppTextField label="Email address" type="email" autoComplete="email" placeholder="maya@example.com" {...fieldProps('email')} />
          <div className="signup-fields">
            <AppTextField label="Password" type="password" autoComplete="new-password" {...fieldProps('password')} />
            <AppTextField label="Confirm password" type="password" autoComplete="new-password" {...fieldProps('confirmPassword')} />
          </div>
          <p className="password-hint">8+ characters with a capital letter and a number.</p>
          <FormControlLabel className="terms-check" control={<Checkbox name="acceptedTerms" checked={formik.values.acceptedTerms} onChange={update} onBlur={formik.handleBlur} disabled={loading} size="small" />} label="I agree to the terms of service and privacy policy." />
          {fieldError('acceptedTerms', 'signup-terms-error')}
          {signupError && <div className="form-error" role="alert">{signupError}</div>}
          <button className="primary-button login-button" type="submit" disabled={loading} aria-busy={loading}>{loading ? 'Creating account…' : 'Create account'}</button>
          <div className="auth-switch">Already have an account? <button type="button" onClick={onShowLogin} disabled={loading}>Sign in</button></div>
        </form>
      </section>
    </main>
  );
}
