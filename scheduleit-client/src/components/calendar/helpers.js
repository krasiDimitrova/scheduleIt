import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday";
import weekOfYear from "dayjs/plugin/weekOfYear";
import isToday from "dayjs/plugin/isToday";
import isBetween from "dayjs/plugin/isBetween";
import _ from "lodash";

dayjs.extend(weekday);
dayjs.extend(weekOfYear);
dayjs.extend(isToday);
dayjs.extend(isBetween);

export const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function getYearDropdownOptions(currentYear) {
  let minYear = currentYear - 4;
  let maxYear = currentYear + 5;
  return _.range(minYear, maxYear + 1).map((y) => ({
    label: `${y}`,
    value: y,
  }));
}

export function getMonthDropdownOptions() {
  return _.range(1, 13).map((m) => ({
    value: m,
    label: dayjs()
      .month(m - 1)
      .format("MMMM"),
  }));
}

export function getDateDropdownOptions(month, year) {
  return _.range(1, getNumberOfDaysInMonth(year, month) + 1).map((d) => ({
    value: d,
    label: d,
  }));
}

export function getNumberOfDaysInMonth(year, month) {
  const newLocal = dayjs(`${year}-${month}-01`);
  const numd = newLocal.daysInMonth();
  return newLocal.daysInMonth();
}

export function createCurrentDay(year, month, date) {
  return {
    dateString: dayjs(`${year}-${month}-${date}`).format("YYYY-MM-DD"),
    dayOfMonth: date,
    isFromCurrentMonth: true,
  };
}

export function createDaysForCurrentMonth(year, month) {
  return [...Array(getNumberOfDaysInMonth(year, month))].map((_, index) => {
    return {
      dateString: dayjs(`${year}-${month}-${index + 1}`).format("YYYY-MM-DD"),
      dayOfMonth: index + 1,
      isFromCurrentMonth: true,
    };
  });
}

export function createDaysForPreviousMonth(year, month, currentMonthDays) {
  const firstDayOfTheMonthWeekday = getWeekday(currentMonthDays[0].dateString);
  const previousMonth = dayjs(`${year}-${month}-01`).subtract(1, "month");

  const visibleNumberOfDaysFromPreviousMonth = firstDayOfTheMonthWeekday;

  const previousMonthLastMondayDayOfMonth = dayjs(
    currentMonthDays[0].dateString
  )
    .subtract(visibleNumberOfDaysFromPreviousMonth, "day")
    .date();

  return [...Array(visibleNumberOfDaysFromPreviousMonth)].map((_, index) => {
    return {
      dateString: dayjs(
        `${previousMonth.year()}-${previousMonth.month() +
          1}-${previousMonthLastMondayDayOfMonth + index}`
      ).format("YYYY-MM-DD"),
      dayOfMonth: previousMonthLastMondayDayOfMonth + index,
      isFromCurrentMonth: false,
    };
  });
}

export function createDaysForNextMonth(year, month, currentMonthDays) {
  const lastDayOfTheMonthWeekday = getWeekday(
    `${year}-${month}-${currentMonthDays.length}`
  );
  const nextMonth = dayjs(`${year}-${month}-01`).add(1, "month");
  const visibleNumberOfDaysFromNextMonth = 6 - lastDayOfTheMonthWeekday;

  return [...Array(visibleNumberOfDaysFromNextMonth)].map((day, index) => {
    return {
      dateString: dayjs(
        `${nextMonth.year()}-${nextMonth.month() + 1}-${index + 1}`
      ).format("YYYY-MM-DD"),
      dayOfMonth: index + 1,
      isFromCurrentMonth: false,
    };
  });
}

export function isDateInRange(date, start, end) {
  return dayjs(date).isBetween(start, end);
}

// sunday === 0, saturday === 6
export function getWeekday(dateString) {
  return dayjs(dateString).weekday();
}

export function getIsToday(dateString) {
  return dayjs(dateString).isToday();
}

export function isWeekendDay(dateString) {
  return [6, 0].includes(getWeekday(dateString));
}

export function getYear() {
  return dayjs().year();
}

export function getMonth() {
  return dayjs().month() + 1;
}

export function getDate() {
  return dayjs().date();
}
