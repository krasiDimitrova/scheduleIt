import React, { Component } from "react";
import M from "materialize-css";

class ViewEventModal extends Component {
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

  render() {
    return (
      <div
        ref={(Modal) => {
          this.Modal = Modal;
        }}
        id="view-event-modal"
        className="modal"
      >
        <div className="modal-content">
          <h4>{this.props.event.title}</h4>
          <span className="valign-wrapper">
            <i className="material-icons teal-text lighten-1">date_range</i>
            {this.props.event.date}
          </span>
          <span className="valign-wrapper">
            <i className="material-icons teal-text lighten-1">access_time</i>
            {this.props.event.time}
          </span>
          <span className="valign-wrapper">
            <i className="material-icons teal-text lighten-1">location_city</i>
            {this.props.event.location}
          </span>
          <span className="valign-wrapper">
            <i className="material-icons teal-text lighten-1">category</i>
            {this.props.event.category &&
              (this.props.categories || []).find(
                (category) => category.id === this.props.event.category
              ).name}
          </span>
          <span className="valign-wrapper">
            <i className="material-icons teal-text lighten-1">comment</i>
            {this.props.event.comment}
          </span>
          <span className="valign-wrapper">
            <i className="material-icons teal-text lighten-1">person</i>{" "}
            {(this.props.event.contacts || [])
              .map((contact) => {
                const foundContact = this.props.contacts.find(
                  (c) => (c.id = contact)
                );
                return `${foundContact.firstName} ${foundContact.lastName}`;
              })
              .join(", ")}
          </span>
          <span className="valign-wrapper">
            <i className="material-icons teal-text lighten-1">email</i>{" "}
            {(this.props.event.userContacts || []).join(", ")}
          </span>
        </div>
        <div className="modal-footer">
          <button
            type="button"
            onClick={this.props.onModalClose}
            className="modal-close btn"
          >
            Close
          </button>
        </div>
      </div>
    );
  }
}

export default ViewEventModal;
