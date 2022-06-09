import { dayFormatter } from "./helpers/date";
import { DayType, Period } from "./helpers/types";
import { checkCurrentDayAndPastDay, checkBetweenDates } from "./helpers/utils";

export default class Day {
  private day: DayType = {};

  constructor(private currentDay: Date) {}

  getDate() {
    this.day.day = dayFormatter(this.currentDay, "yyyy-MM-dd");

    return this;
  }

  getDayNumber() {
    this.day.dayNumber = dayFormatter(this.currentDay, "d");

    return this;
  }

  isCurrentDay(date: Date) {
    if (
      dayFormatter(this.currentDay, "yyyy-MM-dd") ===
      dayFormatter(date, "yyyy-MM-dd")
    ) {
      this.day.isCurrentDay = true;
    }

    return this;
  }

  isPast(date: Date) {
    if (this.day.day && checkCurrentDayAndPastDay(this.day.day, date)) {
      this.day.isPastDay = true;
    }

    return this;
  }

  isStartDate(day: string | undefined) {
    if (this.day.day === day) {
      this.day.isStartDate = true;
    }

    return this;
  }

  isEndDate(day: string | undefined) {
    if (this.day.day === day) {
      this.day.isEndDate = true;
    }

    return this;
  }

  setBookingMarker(period?: Period) {
    if (period?.startDate && period?.endDate) {
      if (checkBetweenDates(period.startDate, period.endDate, this.day.day)) {
        this.day.isBookingMarker = true;
      }
    }

    return this;
  }

  isBooking(range: Required<Period>[] | undefined) {
    if (range) {
      range.forEach((day) => {
        if (day.startDate === this.day.day) {
          this.day.isStartDate = true;
          this.day.isBooking = true;
        }

        if (checkBetweenDates(day.startDate, day.endDate, this.day.day)) {
          this.day.isBooking = true;
        }

        if (day.endDate === this.day.day) {
          this.day.isEndDate = true;
          this.day.isBooking = true;
        }
      });
    }
    return this;
  }

  setBookingType(range: Required<Period>[] | undefined) {
    if (range) {
      range.forEach((day) => {
        if (day.startDate === this.day.day) {
          this.day.bookingType = day.type;
        }

        if (checkBetweenDates(day.startDate, day.endDate, this.day.day)) {
          this.day.bookingType = day.type;
        }

        if (day.endDate === this.day.day) {
          this.day.bookingType = day.type;
        }
      });
    }
    return this;
  }

  setCheckInOutTimes(range: Required<Period>[] | undefined) {
    if (range) {
      range.forEach((day) => {
        if (day.startDate === this.day.day) {
          this.day.checkInTime = day.checkInTime;
          this.day.checkOutTime = day.checkOutTime;
        }

        if (checkBetweenDates(day.startDate, day.endDate, this.day.day)) {
          this.day.checkInTime = day.checkInTime;
          this.day.checkOutTime = day.checkOutTime;
        }

        if (day.endDate === this.day.day) {
          this.day.checkInTime = day.checkInTime;
          this.day.checkOutTime = day.checkOutTime;
        }
      });
    }
    return this;
  }

  setPeriod(range: Required<Period>[] | undefined) {
    if (range) {
      range.forEach((day) => {
        if (day.startDate === this.day.day) {
          this.day.period = { checkIn: day.startDate, checkOut: day.endDate };
        }

        if (checkBetweenDates(day.startDate, day.endDate, this.day.day)) {
          this.day.period = { checkIn: day.startDate, checkOut: day.endDate };
        }

        if (day.endDate === this.day.day) {
          this.day.period = { checkIn: day.startDate, checkOut: day.endDate };
        }
      });
    }
    return this;
  }

  build() {
    return JSON.parse(JSON.stringify(this.day));
  }
}