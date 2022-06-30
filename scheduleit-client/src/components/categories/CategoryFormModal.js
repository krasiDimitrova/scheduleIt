import React, { Component } from "react";
import M from "materialize-css";
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";

class CategoryFormModal extends Component {
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

  CategorySchema = Yup.object().shape({
    name: Yup.string()
      .min(2, "Too Short!")
      .max(50, "Too Long!")
      .required("Required"),
  });

  render() {
    return (
      <>
        <a
          href="#!"
          className="btn modal-trigger btn-floating btn-large"
          data-target="category-form-modal"
        >
          <i className="material-icons">add</i>
        </a>

        <div
          ref={(Modal) => {
            this.Modal = Modal;
          }}
          id="category-form-modal"
          className="modal"
        >
          <div className="modal-content">
            <h4>Add category</h4>
            <Formik
              initialValues={{
                name: "",
              }}
              validationSchema={this.CategorySchema}
              onSubmit={async (values, { resetForm }) => {
                let newCategory = { name: values.name };
                this.props.onSubmit(newCategory);
                resetForm({ values: "" });
              }}
            >
              {({ errors, touched, isValid, dirty, resetForm }) => (
                <Form>
                  <Field id="name" name="name" placeholder="work" />
                  {errors.name && touched.name ? (
                    <div className="invalid-input">{errors.name}</div>
                  ) : null}

                  <div className="modal-footer">
                    <button
                      type="submit"
                      className="modal-close btn"
                      disabled={!(isValid && dirty)}
                    >
                      Add
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
      </>
    );
  }
}

export default CategoryFormModal;
