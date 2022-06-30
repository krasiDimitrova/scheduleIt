import { Week } from "./Week";
import {
  createDaysForCurrentMonth,
  createDaysForNextMonth,
  createDaysForPreviousMonth,
  daysOfWeek,
  isDateInRange,
} from "./helpers";
import React from "react";
import AddEventFormModal from "./events/AddEventFormModa";

export class Month extends React.Component {
  REST_API_URL = "http://localhost:9000/api/event";

  constructor(props) {
    super(props);
    let allDays = this.defineMonthDays(this.props.year, this.props.month);
    this.state = {
      days: allDays,
      events: [],
      categories: [],
      contacts: [],
      currentEvent: null,
    };
  }

  async componentDidUpdate(prevProps) {
    if (
      prevProps.year !== this.props.year ||
      prevProps.month !== this.props.month
    ) {
      let allDays = this.defineMonthDays(this.props.year, this.props.month);
      this.setState({ days: allDays });
      this.loadEvents();
    }
  }

  defineMonthDays(year, month) {
    let currentMonthDays = createDaysForCurrentMonth(year, month);
    let prevMonthDays = createDaysForPreviousMonth(
      year,
      month,
      currentMonthDays
    );
    let nextMonthDays = createDaysForNextMonth(year, month, currentMonthDays);

    return prevMonthDays.concat(currentMonthDays).concat(nextMonthDays);
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
        this.setState({ categories: data });
      } else {
        this.setState({ error: data.message });
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
        this.setState({ contacts: data });
      } else {
        this.setState({ error: data.message });
      }
    });
  }

  componentDidMount() {
    this.loadEvents();
    this.loadContacts();
    this.loadCategories();
  }

  loadEvents() {
    this.setState({ events: [] });
    const days = this.state.days;
    const start = days[0].dateString;
    const end = days[days.length - 1].dateString;
    fetch(`${this.REST_API_URL}?start=${start}&end=${end}`, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    }).then(async (response) => {
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
        if (
          isDateInRange(
            event.date,
            this.state.days[0].dateString,
            this.state.days[this.state.days.length - 1].dateString
          )
        ) {
          let currentEvents = [...this.state.events];
          currentEvents.push(data);
          this.setState({ events: currentEvents });
        }
      } else {
        this.setState({ error: data.message });
      }
    });
  }

  render() {
    let days = this.state.days;
    let events = this.state.events;

    let weeks = [];
    for (let i = 0; i < days.length / 7; i++) {
      const weekDays = days.slice(i * 7, i * 7 + 7);
      let weekEvents = {};
      weekDays.forEach((day) => {
        let eventsForDay = events.filter(
          (event) => event.date === day.dateString
        );
        weekEvents[day.dateString] = eventsForDay;
      });
      weeks.push(
        <Week
          key={i}
          days={weekDays}
          events={weekEvents}
          editEvent={(event) => this.editEvent(event)}
          deleteEvent={(event) => this.deleteEvent(event)}
          contacts={this.state.contacts}
          categories={this.state.categories}
        />
      );
    }

    return (
      <>
        <AddEventFormModal
          onSubmit={(event) => this.addEvent(event)}
          categories={this.state.categories}
          contacts={this.state.contacts}
        />
        <p>{this.state.error}</p>

        <table className="centered bordered">
          <thead>
            <tr>
              {daysOfWeek.map((day, i) => (
                <th key={i} className="day-name">
                  {day}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="calendar-body">{weeks}</tbody>
        </table>
      </>
    );
  }
}
