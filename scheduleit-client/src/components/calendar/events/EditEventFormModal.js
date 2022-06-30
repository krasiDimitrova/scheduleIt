import React, { Component } from "react";
import M from "materialize-css";
import { Formik, Field, Form, FieldArray } from "formik";
import * as Yup from "yup";

class EditEventFormModal extends Component {
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

  EventSchema = Yup.object().shape({
    title: Yup.string()
      .min(2, "Too Short!")
      .max(50, "Too Long!")
      .required("Required"),
    date: Yup.date().required("Required"),
    time: Yup.string().required("Required"),
    userContacts: Yup.array().of(
      Yup.string()
        .email("Invalid email")
        .required("Required")
    ),
    contacts: Yup.array(Yup.string()),
    comment: Yup.string().required("Required"),
  });

  render() {
    return (
      <div
        ref={(Modal) => {
          this.Modal = Modal;
        }}
        id="edit-event-form-modal"
        className="modal"
      >
        <div className="modal-content">
          <h4>Edit Contact</h4>
          <Formik
            initialValues={{
              id: this.props.event.id,
              title: this.props.event.title,
              comment: this.props.event.comment,
              category: this.props.event.category,
              location: this.props.event.location,
              contacts: this.props.event.contacts,
              userContacts: this.props.event.userContacts,
              date: this.props.event.date,
              time: this.props.event.time,
            }}
            validationSchema={this.EventSchema}
            onSubmit={async (values, { resetForm }) => {
              console.log(this.props);
              this.props.onSubmit(values);
              resetForm({ values: "" });
            }}
          >
            {({ values, errors, touched, isValid, dirty, resetForm }) => (
              <Form>
                <label htmlFor="title">title</label>
                <Field id="name" name="title" placeholder="Test" />
                {errors.title && touched.title ? (
                  <div className="invalid-input">{errors.title}</div>
                ) : null}

                <label htmlFor="date">Date</label>
                <Field id="date" name="date" type="date" />
                {errors.date && touched.date ? (
                  <div className="invalid-input">{errors.date}</div>
                ) : null}

                <label htmlFor="time">Time</label>
                <Field id="time" name="time" type="time" />
                {errors.time && touched.time ? (
                  <div className="invalid-input">{errors.time}</div>
                ) : null}

                <label htmlFor="category">Category</label>
                <Field
                  as="select"
                  id="category"
                  name="category"
                  className="browser-default"
                >
                  <option disabled value="">
                    Select a caetgory
                  </option>
                  {(this.props.categories || []).map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Field>

                <label htmlFor="location">Location</label>
                <Field
                  id="location"
                  name="location"
                  placeholder="32 Apple St."
                />

                <label htmlFor="comment">Comment</label>
                <Field id="comment" name="comment" placeholder="comment" />

                <label htmlFor="contacts">Contacts</label>
                <FieldArray name="contacts">
                  {({ insert, remove, push }) => (
                    <div>
                      {values.contacts.length > 0 &&
                        values.contacts.map((selectedContact, index) => (
                          <div className="row" key={index}>
                            <div className="col">
                              <Field
                                id={`contacts.${index}`}
                                as="select"
                                name={`contacts.${index}`}
                                className="browser-default"
                              >
                                <option disabled value="">
                                  Select a contact
                                </option>
                                {(this.props.contacts || []).map((contact) => (
                                  <option key={contact.id} value={contact.id}>
                                    {contact.firstName} {contact.lastName}
                                  </option>
                                ))}
                              </Field>
                            </div>
                            <div>
                              <button
                                type="button"
                                className="btn secondary"
                                onClick={() => remove(index)}
                              >
                                X
                              </button>
                            </div>
                          </div>
                        ))}
                      <button
                        type="button"
                        className="btn secondary"
                        onClick={() => push("")}
                      >
                        +
                      </button>
                    </div>
                  )}
                </FieldArray>

                <label htmlFor="userContacts">User contacts</label>
                <FieldArray name="userContacts">
                  {({ insert, remove, push }) => (
                    <div>
                      {values.userContacts.length > 0 &&
                        values.userContacts.map((contact, index) => (
                          <div className="row" key={index}>
                            <div className="col" key={index}>
                              <Field
                                id={`userContacts.${index}`}
                                name={`userContacts.${index}`}
                                placeholder="jane@acme.com"
                                type="email"
                              />
                              {errors.userContacts &&
                              errors.userContacts[index] &&
                              touched.userContacts &&
                              touched.userContacts[index] ? (
                                <div className="invalid-input">
                                  {errors.userContacts[index]}
                                </div>
                              ) : null}
                            </div>
                            <div>
                              <button
                                type="button"
                                className="btn secondary"
                                onClick={() => remove(index)}
                              >
                                X
                              </button>
                            </div>
                          </div>
                        ))}
                      <button
                        type="button"
                        className="btn secondary"
                        onClick={() => push("")}
                      >
                        +
                      </button>
                    </div>
                  )}
                </FieldArray>

                <div className="modal-footer">
                  <button
                    disabled={!(isValid && dirty)}
                    type="submit"
                    className="modal-close btn"
                  >
                    Submit
                  </button>
                  <button
                    type="button"
                    className="modal-close btn"
                    onClick={() => resetForm({ values: "" })}
                  >
                    Close
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    );
  }
}

export default EditEventFormModal;
