import React from "react";
import EditEventFormModal from "./events/EditEventFormModal";
import ViewEventModal from "./events/ViewEventModal";
import { getIsToday } from "./helpers";

export class Day extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentEvent: null,
    };
  }

  renderEvents() {
    if (this.props.events.length < 1) {
      return null;
    }

    return (
      <ul className="collection">
        {this.props.events
          .sort((a, b) => a.time.localeCompare(b.time))
          .map((event) => (
            <li className="collection-item" key={event.id}>
              <div>{event.time}</div>
              <div>{event.title}</div>
              <div className="row">
                <button
                  className="btn btn-flat col s4 teal-text lighten-1 modal-trigger"
                  data-target="view-event-modal"
                  onClick={() => this.setState({ currentEvent: event })}
                >
                  <i className="material-icons">remove_red_eye</i>
                </button>
                {!event.invited && (
                  <>
                    <button
                      className="btn btn-flat col s4 teal-text lighten-1 modal-trigger"
                      data-target="edit-event-form-modal"
                      onClick={() =>
                        this.setState({
                          events: this.state.events,
                          currentEvent: event,
                        })
                      }
                    >
                      <i className="material-icons">edit</i>
                    </button>
                    <button
                      className="btn-flat col s4 teal-text lighten-1"
                      onClick={() => this.props.deleteEvent(event)}
                    >
                      <i className="material-icons">delete_forever</i>
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
      </ul>
    );
  }

  render() {
    const isToday = getIsToday(this.props.currentDay.dateString);
    const currentDay = this.props.currentDay;
    const viewModal = this.state.currentEvent ? (
      <ViewEventModal
        event={this.state.currentEvent}
        categories={this.props.categories}
        contacts={this.props.contacts}
        onModalClose={() => this.setState({ currentEvent: null })}
      />
    ) : null;

    const editModal =
      this.state.currentEvent && !this.state.currentEvent.invited ? (
        <EditEventFormModal
          event={this.state.currentEvent}
          onSubmit={(editedEvent) => this.props.editEvent(editedEvent)}
          onModalClose={() => this.setState({ currentEvent: null })}
          contacts={this.props.contacts}
          categories={this.props.categories}
        />
      ) : null;

    return (
      <>
        <td
          className={`day top ${isToday ? "red lighten-5" : ""} ${
            currentDay.isFromCurrentMonth ? "" : "grey lighten-5"
          }`}
        >
          <div className="teal lighten-4">
            {this.props.currentDay.dayOfMonth}
          </div>
          <div className="day-events-warapper">{this.renderEvents()}</div>
        </td>
        {viewModal}
        {editModal}
      </>
    );
  }
}
