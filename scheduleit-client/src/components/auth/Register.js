import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";

const registrationSchema = Yup.object().shape({
  username: Yup.string()
    .min(4, "Too Short!")
    .max(20, "Too Long!")
    .required("Username is required"),
  password: Yup.string()
    .min(6, "Too Short!")
    .max(20, "Too Long!")
    .required("Password is required"),
  firstName: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("First name is required"),
  lastName: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Last name is required"),
  email: Yup.string()
    .email("Invalid email")
    .required("Email is eequired"),
});

export default function RegistrationForm() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleSubmit = (values) => {
    const REST_API_URL = "http://localhost:9000/api/auth/register";
    fetch(REST_API_URL, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    })
      .then(async (response) => {
        const data = await response.json();
        if (response.ok) {
          return data;
        } else {
          throw new Error(data.message);
        }
      })
      .then((data) => {
        navigate("/login");
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  return (
    <Formik
      initialValues={{ username: "", password: "" }}
      validationSchema={registrationSchema}
      onSubmit={handleSubmit}
    >
      {() => {
        return (
          <>
            <p>{error}</p>
            <Form>
              <label htmlFor="username">Username</label>
              <Field id="username" name="username" />
              <ErrorMessage name="username" component="div" />
              <label htmlFor="password">Password</label>
              <Field type="password" name="password" />
              <ErrorMessage name="password" component="div" />
              <label htmlFor="firstName">First name</label>
              <Field id="firstName" name="firstName" />
              <ErrorMessage name="firstName" component="div" />
              <label htmlFor="lastName">Last name</label>
              <Field id="lastName" name="lastName" />
              <ErrorMessage name="lastName" component="div" />
              <label htmlFor="email">Email</label>
              <Field type="email" name="email" />
              <ErrorMessage name="email" component="div" />
              <button type="submit" className="btn">
                Register
              </button>
            </Form>
            <button className="btn" onClick={() => navigate("/login")}>
              Login
            </button>
          </>
        );
      }}
    </Formik>
  );
}
