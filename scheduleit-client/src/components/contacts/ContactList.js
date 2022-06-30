import React from "react";
import ContactFormModal from "./ContactFormModal";
import EditContactFormModal from "./EditContactFormModal";
import "./Contacts.css";

export class ContactList extends React.Component {
  REST_API_URL = "http://localhost:9000/api/contact";

  constructor(props) {
    super(props);
    this.state = {
      contacts: [],
      currentContact: null,
      error: null,
    };
  }

  componentDidMount() {
    fetch(this.REST_API_URL, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    }).then(async (response) => {
      const data = await response.json();
      if (response.ok) {
        this.setState({
          contacts: data,
          currentContact: null,
          error: null,
        });
      } else {
        this.setState({
          contacts: [],
          currentContact: null,
          error: data.message,
        });
      }
    });
  }

  onSubmitOfNewContact(newContact) {
    fetch(this.REST_API_URL, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
      body: JSON.stringify(newContact),
    }).then(async (response) => {
      const data = await response.json();

      if (response.ok) {
        let currentContacts = [...this.state.contacts];
        currentContacts.push(data);
        this.setState({
          contacts: currentContacts,
          currentContact: null,
          error: null,
        });
      } else {
        this.setState({
          contacts: this.state.contacts,
          currentContact: null,
          error: data.message,
        });
      }
    });
  }

  deleteContact(id) {
    fetch(`${this.REST_API_URL}\\${id}`, {
      method: "delete",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    }).then(async (response) => {
      const data = await response.json();

      if (response.ok) {
        let currentContacts = [...this.state.contacts];
        currentContacts = currentContacts.filter(
          (contact) => contact.id !== id
        );
        this.setState({
          contacts: currentContacts,
          currentContact: null,
          error: null,
        });
      } else {
        this.setState({
          contacts: this.state.contacts,
          currentContact: null,
          error: data.message,
        });
      }
    });
  }

  editContact(editedContact) {
    fetch(`${this.REST_API_URL}\\${editedContact.id}`, {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
      body: JSON.stringify(editedContact),
    }).then(async (response) => {
      const data = await response.json();

      if (response.ok) {
        let currentContacts = [...this.state.contacts];
        const index = currentContacts.findIndex(
          (contact) => contact.id === data.id
        );
        currentContacts.splice(index, 1, data);
        this.setState({
          contacts: currentContacts,
          currentContact: null,
          error: null,
        });
      } else {
        this.setState({
          contacts: this.state.contacts,
          currentContact: null,
          error: data.message,
        });
      }
    });
  }

  render() {
    return (
      <div className="section">
        <div className="row">
          <div className="col s12 contacts-header">
            <h5>Personal contacts</h5>
            <ContactFormModal
              onSubmit={(newContact) => this.onSubmitOfNewContact(newContact)}
            />
          </div>
          <p>{this.state.error}</p>

          {this.state.contacts.map((contact) => (
            <div className="col s6" key={contact.id}>
              <div className="card">
                <div className="card-content">
                  <span className="card-title">
                    {contact.firstName} {contact.lastName}
                  </span>
                  <span className="valign-wrapper">
                    <i className="material-icons teal-text lighten-1">email</i>
                    {contact.email}
                  </span>
                  <span className="valign-wrapper">
                    <i className="material-icons teal-text lighten-1">phone</i>
                    {contact.phone}
                  </span>
                  <span className="valign-wrapper">
                    <i className="material-icons teal-text lighten-1">
                      location_city
                    </i>
                    {contact.address}
                  </span>
                  <span className="valign-wrapper">
                    <i className="material-icons teal-text lighten-1">
                      comment
                    </i>
                    {contact.comment}
                  </span>
                </div>
                <div className="card-action">
                  <EditContactFormModal
                    key={contact.id}
                    currentContact={contact}
                    onSubmit={(editedContact) =>
                      this.editContact(editedContact)
                    }
                  />
                  <button
                    className="btn-flat teal-text lighten-1"
                    onClick={() => this.deleteContact(contact.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}
