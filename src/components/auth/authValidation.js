import * as Yup from "yup";

const passwordRules = Yup.string()
  .required("Password is required.")
  .min(8, "Password must be at least 8 characters.")
  .matches(/[A-Z]/, "Password must contain a capital letter.")
  .matches(/[0-9]/, "Password must contain a number.");

export const loginValidationSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email("Enter a valid email address.")
    .required("Email address is required."),
  password: Yup.string().required("Password is required."),
});

export const signupValidationSchema = Yup.object({
  fullName: Yup.string()
    .trim()
    .min(2, "Full name must contain at least 2 characters.")
    .max(100, "Full name cannot exceed 100 characters.")
    .required("Full name is required."),
  phone: Yup.string()
    .trim()
    .matches(/^\+?[0-9\s()-]{7,20}$/, "Enter a valid phone number.")
    .required("Phone number is required."),
  email: Yup.string()
    .trim()
    .email("Enter a valid email address.")
    .required("Email address is required."),
  password: passwordRules,
  confirmPassword: Yup.string()
    .required("Confirm your password.")
    .oneOf([Yup.ref("password")], "The passwords do not match."),
  acceptedTerms: Yup.boolean().oneOf([true], "Accept the terms to continue."),
});
