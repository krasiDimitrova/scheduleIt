import React, { Component } from "react";
import M from "materialize-css";
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import { get } from "lodash";

class EditContactFormModal extends Component {
  componentDidMount() {
    const options = {
      inDuration: 250,
      outDuration: 250,
      opacity: 0.5,
      dismissible: false,
      startingTop: "4%",
      endingTop: "10%",
    };
    M.Modal.init(this.Modal, options);
  }

  ContactSchema = Yup.object().shape({
    firstName: Yup.string()
      .min(2, "Too Short!")
      .max(50, "Too Long!")
      .required("Required"),
    lastName: Yup.string()
      .min(2, "Too Short!")
      .max(50, "Too Long!")
      .required("Required"),
    email: Yup.string()
      .email("Invalid email")
      .required("Required"),
    address: Yup.string()
      .min(2, "Too Short!")
      .max(250, "Too Long!"),
    phone: Yup.string().matches(
      /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/,
      "Phone number is not valid"
    ),
    comment: Yup.string().max(500, "Too Long!"),
  });

  render() {
    return (
      <>
        <button
          className="btn-flat teal-text lighten-1 modal-trigger"
          data-target={this.props.currentContact.id}
        >
          Edit
        </button>
        <div
          ref={(Modal) => {
            this.Modal = Modal;
          }}
          id={this.props.currentContact.id}
          className="modal"
        >
          <div className="modal-content">
            <h4>Manage Contact</h4>
            <Formik
              initialValues={{
                id: get(this.props.currentContact, "id"),
                firstName: get(this.props.currentContact, "firstName"),
                lastName: get(this.props.currentContact, "lastName"),
                email: get(this.props.currentContact, "email"),
                phone: get(this.props.currentContact, "phone"),
                address: get(this.props.currentContact, "address"),
                comment: get(this.props.currentContact, "comment"),
              }}
              enableReinitialize
              validationSchema={this.ContactSchema}
              onSubmit={async (values, { resetForm }) => {
                this.props.onSubmit(values);
                resetForm({ values: "" });
              }}
            >
              {({ values, errors, touched, isValid, dirty }) => (
                <Form>
                  <label htmlFor="firstName">First Name</label>
                  <Field
                    id="firstName"
                    name="firstName"
                    placeholder="Jane"
                    value={values.firstName}
                  />
                  {errors.firstName && touched.firstName ? (
                    <div className="invalid-input">{errors.firstName}</div>
                  ) : null}

                  <label htmlFor="lastName">Last Name</label>
                  <Field id="lastName" name="lastName" placeholder="Doe" />
                  {errors.lastName && touched.lastName ? (
                    <div className="invalid-input">{errors.lastName}</div>
                  ) : null}

                  <label htmlFor="email">Email</label>
                  <Field
                    id="email"
                    name="email"
                    placeholder="jane@acme.com"
                    type="email"
                  />
                  {errors.email && touched.email ? (
                    <div className="invalid-input">{errors.email}</div>
                  ) : null}

                  <label htmlFor="phone">Phone</label>
                  <Field id="phone" name="phone" placeholder="359888888888" />
                  {errors.phone && touched.phone ? (
                    <div className="invalid-input">{errors.phone}</div>
                  ) : null}

                  <label htmlFor="address">Address</label>
                  <Field
                    id="address"
                    name="address"
                    placeholder="Apple St."
                    type="text"
                  />
                  {errors.address && touched.address ? (
                    <div class="invalid-input">{errors.address}</div>
                  ) : null}

                  <label htmlFor="comment">Comment</label>
                  <Field id="comment" name="comment" type="text" />
                  {errors.comment && touched.comment ? (
                    <div className="invalid-input">{errors.comment}</div>
                  ) : null}

                  <div className="modal-footer">
                    <button
                      disabled={!(isValid && dirty)}
                      type="submit"
                      className="modal-close btn"
                    >
                      Submit
                    </button>
                    <button type="button" className="modal-close btn">
                      Close
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </>
    );
  }
}

export default EditContactFormModal;
