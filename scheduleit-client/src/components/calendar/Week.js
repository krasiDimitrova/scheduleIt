import { Day } from "./Day";
import React from "react";

export class Week extends React.Component {
  render() {
    return (
      <tr>
        {this.props.days.map((day) => (
          <Day
            key={day.dateString}
            currentDay={day}
            events={this.props.events[day.dateString]}
            editEvent={this.props.editEvent}
            deleteEvent={this.props.deleteEvent}
            contacts={this.props.contacts}
            categories={this.props.categories}
          />
        ))}
      </tr>
    );
  }
}
