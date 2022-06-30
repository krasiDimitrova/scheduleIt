import React from "react";
import AddEventFormModal from "./events/AddEventFormModa";
import EditEventFormModal from "./events/EditEventFormModal";
import ViewEventModal from "./events/ViewEventModal";
import { getIsToday, getWeekday, daysOfWeek } from "./helpers";

export class SingleDay extends React.Component {
  REST_API_URL = "http://localhost:9000/api/event";
  constructor(props) {
    super(props);
    this.state = {
      events: [],
      categories: [],
      contacts: [],
      currentEvent: null,
      error: null,
    };
  }

  async componentDidMount() {
    this.loadEvents();
    this.loadContacts();
    this.loadCategories();
  }

  async componentDidUpdate(prevProps) {
    if (prevProps.currentDay.dateString !== this.props.currentDay.dateString) {
      this.loadEvents();
    }
  }

  loadCategories() {
    fetch("http://localhost:9000/api/category", {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    }).then(async (response) => {
      const data = await response.json();
      if (response.ok) {
        this.setState({
          categories: data,
        });
      } else {
        this.setState({
          error: data.message,
        });
      }
    });
  }

  loadContacts() {
    fetch("http://localhost:9000/api/contact", {
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
        });
      } else {
        this.setState({ error: data.message });
      }
    });
  }

  loadEvents() {
    fetch(
      `${this.REST_API_URL}?start=${this.props.currentDay.dateString}&end=${this.props.currentDay.dateString}`,
      {
        method: "get",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      }
    ).then(async (response) => {
      const data = await response.json();
      if (response.ok) {
        this.setState({ events: data });
      } else {
        this.setState({ error: data.message });
      }
    });
  }

  deleteEvent(event) {
    fetch(`${this.REST_API_URL}\\${event.id}`, {
      method: "delete",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    }).then(async (response) => {
      const data = await response.json();

      if (response.ok) {
        let currentEvents = [...this.state.events];
        currentEvents = currentEvents.filter((e) => e.id !== data.id);
        this.setState({ events: currentEvents });
      } else {
        this.setState({ error: data.message });
      }
    });
  }

  editEvent(editedEvent) {
    fetch(`${this.REST_API_URL}\\${editedEvent.id}`, {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
      body: JSON.stringify(editedEvent),
    }).then(async (response) => {
      const data = await response.json();

      if (response.ok) {
        let currentEvents = [...this.state.events];
        const index = currentEvents.findIndex((event) => event.id === data.id);
        currentEvents.splice(index, 1, data);
        this.setState({ events: currentEvents });
      } else {
        this.setState({ error: data.message });
      }
    });
  }

  addEvent(event) {
    fetch(this.REST_API_URL, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
      body: JSON.stringify(event),
    }).then(async (response) => {
      const data = await response.json();

      if (response.ok) {
        if (event.date === this.props.currentDay.dateString) {
          let currentEvents = [...this.state.events];
          currentEvents.push(event);
          this.setState({ events: currentEvents });
        }
      } else {
        this.setState({ error: data.message });
      }
    });
  }

  render() {
    const isToday = getIsToday(this.props.currentDay.dateString);
    const viewModal = this.state.currentEvent ? (
      <ViewEventModal
        event={this.state.currentEvent}
        categories={this.state.categories}
        contacts={this.state.contacts}
        onModalClose={() => this.setState({ currentEvent: null })}
      />
    ) : null;

    const editModal =
      this.state.currentEvent && !this.state.currentEvent.invited ? (
        <EditEventFormModal
          event={this.state.currentEvent}
          onSubmit={(editedEvent) => this.editEvent(editedEvent)}
          onModalClose={() => this.setState({ currentEvent: null })}
          contacts={this.state.contacts}
          categories={this.state.categories}
        />
      ) : null;

    return (
      <div>
        <AddEventFormModal
          onSubmit={(event) => this.addEvent(event)}
          categories={this.state.categories}
          contacts={this.state.contacts}
        />
        <p>{this.state.error}</p>

        <ul className="collection with-header col s12">
          <li
            className={`collection-header ${isToday ? "red lighten-5" : null}`}
          >
            <h5>{daysOfWeek[getWeekday(this.props.currentDay.dateString)]}</h5>
          </li>
          {this.state.events
            .sort((a, b) => a.time.localeCompare(b.time))
            .map((event) => (
              <li className="collection-item" key={event.id}>
                <span>
                  {event.time} {event.title}
                </span>
                <div className="secondary-content">
                  <button
                    className="btn btn-flat teal-text lighten-1 modal-trigger"
                    data-target="view-event-modal"
                    onClick={() => this.setState({ currentEvent: event })}
                  >
                    <i className="material-icons">remove_red_eye</i>
                  </button>
                  {!event.invited && (
                    <>
                      <button
                        className="btn btn-flat teal-text lighten-1 modal-trigger"
                        data-target="edit-event-form-modal"
                        onClick={() => this.setState({ currentEvent: event })}
                      >
                        <i className="material-icons">edit</i>
                      </button>
                      <button
                        className="btn-flat col s4 teal-text lighten-1"
                        onClick={() => this.deleteEvent(event)}
                      >
                        <i className="material-icons">delete_forever</i>
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
        </ul>
        {viewModal}
        {editModal}
      </div>
    );
  }
}
