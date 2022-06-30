import { Month } from "./Month";
import "./Calendar.css";
import React from "react";
import {
  getDate,
  getMonth,
  getDateDropdownOptions,
  getMonthDropdownOptions,
  getYear,
  getYearDropdownOptions,
  createCurrentDay,
} from "./helpers";
import { SingleDay } from "./SingleDay";

export class Calendar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      year: getYear(),
      month: getMonth(),
      date: getDate(),
      dayView: true,
    };
  }

  handleYearSelect(evt) {
    let nextYear = parseInt(evt.target.value, 10);
    this.onDateChange(nextYear, this.state.month, this.state.date);
  }

  handleMonthSelect(evt) {
    let nextMonth = parseInt(evt.target.value, 10);
    this.onDateChange(this.state.year, nextMonth, this.state.date);
  }

  handleDateSelect(evt) {
    let nextDate = parseInt(evt.target.value, 10);
    this.onDateChange(this.state.year, this.state.month, nextDate);
  }

  onDateChange(year, month, date) {
    this.setState({
      year: year,
      month: month,
      date: date,
      dayView: this.state.dayView,
    });
  }

  handleViewChange() {
    this.setState({
      year: this.state.year,
      month: this.state.month,
      date: this.state.date,
      dayView: !this.state.dayView,
    });
  }

  renderDateSelect(date) {
    return !this.state.dayView ? null : (
      <div className="input-field col s3">
        <select
          className="browser-default"
          value={date}
          onChange={(evt) => this.handleDateSelect(evt)}
        >
          {getDateDropdownOptions(this.state.month, this.state.year).map(
            ({ label, value }) => (
              <option value={value} key={value}>
                {label}
              </option>
            )
          )}
        </select>
      </div>
    );
  }

  render() {
    const [year, month, date] = [
      this.state.year,
      this.state.month,
      this.state.date,
    ];
    const currentDay = createCurrentDay(year, month, date);
    const view = this.state.dayView ? (
      <SingleDay
        currentDay={currentDay}
        loadContacts={this.loadContacts}
        loadCategories={this.loadCategories}
      />
    ) : (
      <Month
        year={year}
        month={month}
        loadContacts={this.loadContacts}
        loadCategories={this.loadCategories}
      />
    );
    return (
      <div>
        <div className="row valign-wrapper">
          <div className="col s4 offset-s3">
            {this.renderDateSelect(date)}

            <div className="input-field col s5">
              <select
                className="browser-default"
                value={month}
                onChange={(evt) => this.handleMonthSelect(evt)}
              >
                {getMonthDropdownOptions().map(({ label, value }) => (
                  <option value={value} key={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="input-field col s3">
              <select
                className="browser-default"
                value={year}
                onChange={(evt) => this.handleYearSelect(evt)}
              >
                {getYearDropdownOptions(year).map(({ label, value }) => (
                  <option value={value} key={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="switch col s5">
            <label>
              day
              <input type="checkbox" onChange={() => this.handleViewChange()} />
              <span className="lever"></span>
              month
            </label>
          </div>
        </div>

        <div className="section">{view}</div>
      </div>
    );
  }
}
