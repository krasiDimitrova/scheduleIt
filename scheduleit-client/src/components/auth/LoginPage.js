import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";

const loginSchema = Yup.object().shape({
  username: Yup.string().required("username is required"),
  password: Yup.string().required("Password is required"),
});

export default function LoginForm() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleSubmit = (values) => {
    const REST_API_URL = "http://localhost:9000/api/auth/login";
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
        sessionStorage.setItem("token", data.token);
        navigate("/calendar");
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  return (
    <Formik
      initialValues={{ username: "", password: "" }}
      validationSchema={loginSchema}
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
              <button type="submit" className="btn">
                Login
              </button>
            </Form>
            <button className="btn" onClick={() => navigate("/register")}>
              Register
            </button>
          </>
        );
      }}
    </Formik>
  );
}
