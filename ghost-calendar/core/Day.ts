import { dayFormatter } from "./helpers/date";
import {
  DayType,
  Period,
  BookingColorType,
  BookingInfo,
  ContractInfo,
  OwnerInfo,
  WorldTimezones,
} from "./helpers/types";
import { checkCurrentDayAndPastDay, checkBetweenDates } from "./helpers/utils";

export default class Day {
  private day: DayType = {};

  constructor(private currentDay: Date, private timezone?: WorldTimezones) {}

  private setContractInfo(day: Required<Period> & ContractInfo & OwnerInfo) {
    this.day.clientFirstname = day.clientFirstname;
    this.day.clientLastname = day.clientLastname;
    this.day.currencyTrigram = day.currencyTrigram;
    this.day.ownerPrice = day.ownerPrice;
    this.day.contractId = day.contractId;
    this.day.ownerPrivateToken = day.ownerPrivateToken;
    this.day.ownerUploadYousignFileToken = day.ownerUploadYousignFileToken;
    this.day.isManualySignedContract = day.isManualySignedContract;
  }

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
    if (
      this.day.day &&
      checkCurrentDayAndPastDay(this.day.day, date, this.timezone)
    ) {
      this.day.isPastDay = true;
    }

    return this;
  }

  isCheckInCheckOut(checkIn?: Date, checkOut?: Date) {
    if (checkIn && dayFormatter(checkIn, "yyyy-MM-dd") === this.day.day) {
      this.day.isStartDate = true;
    } else if (
      checkOut &&
      dayFormatter(checkOut, "yyyy-MM-dd") === this.day.day
    ) {
      this.day.isEndDate = true;
    }

    return this;
  }

  isStartDate(day: string | undefined) {
    if (this.day.day === day) {
      this.day.isStartDate = true;
      this.day.isSelectedDate = true;
    }

    return this;
  }

  isEndDate(day: string | undefined) {
    if (this.day.day === day) {
      this.day.isEndDate = true;
      this.day.isSelectedDate = true;
    }

    return this;
  }

  isHalfDay() {
    if (this.day.isStartDate && this.day.isEndDate) this.day.isHalfDay = true;

    return this;
  }

  setRangeDate(period?: Period, checkIn?: Date, checkOut?: Date) {
    if (
      checkIn &&
      checkOut &&
      checkBetweenDates(
        dayFormatter(checkIn, "yyyy-MM-dd"),
        dayFormatter(checkOut, "yyyy-MM-dd"),
        this.day.day
      )
    )
      this.day.isRangeDate = true;

    if (period?.startDate && period?.endDate) {
      if (checkBetweenDates(period.startDate, period.endDate, this.day.day))
        this.day.isRangeDate = true;
    }

    return this;
  }

  dayManagement(
    range: Required<Period>[] | undefined,
    options: { bookingColors?: BookingColorType }
  ) {
    if (range) {
      range.forEach((day) => {
        this.isBooking(day);
        this.setBookingType(day, options.bookingColors);
        this.setCheckInOutTimes(day);
        this.setPeriod(day);
        this.setBookingId(day);
        this.setOtherType(day);
        this.setBookingContractInfo(day);
        this.setBookingComment(day);
      });
    }

    return this;
  }

  private isBooking(day: Required<Period>) {
    if (day.startDate === this.day.day) {
      this.day.isStartDate = true;
      this.day.isBooking = true;
    }

    if (checkBetweenDates(day.startDate, day.endDate, this.day.day))
      this.day.isBooking = true;

    if (day.endDate === this.day.day) {
      this.day.isEndDate = true;
      this.day.isBooking = true;
    }
  }

  private setBookingType(
    day: Required<Period>,
    bookingColors?: BookingColorType
  ) {
    if (day.startDate === this.day.day) {
      this.day.bookingType = day.type;

      if (
        bookingColors &&
        bookingColors[day.type] &&
        bookingColors[day.type].startEnd
      )
        this.day.bookingColor = bookingColors[day.type].startEnd;
    }

    if (checkBetweenDates(day.startDate, day.endDate, this.day.day)) {
      this.day.bookingType = day.type;

      if (
        bookingColors &&
        bookingColors[day.type] &&
        bookingColors[day.type].beetween
      )
        this.day.bookingColor = bookingColors[day.type].beetween;
    }

    if (day.endDate === this.day.day) {
      this.day.bookingType = day.type;

      if (
        bookingColors &&
        bookingColors[day.type] &&
        bookingColors[day.type].startEnd
      )
        this.day.bookingColor = bookingColors[day.type].startEnd;
    }
  }

  private setCheckInOutTimes(day: Required<Period>) {
    const conditionOk =
      day.startDate === this.day.day ||
      checkBetweenDates(day.startDate, day.endDate, this.day.day) ||
      day.endDate === this.day.day;

    if (conditionOk) {
      this.day.checkInTime = day.checkInTime;
      this.day.checkOutTime = day.checkOutTime;
    }
  }

  private setPeriod(day: Required<Period>) {
    const conditionOk =
      day.startDate === this.day.day ||
      checkBetweenDates(day.startDate, day.endDate, this.day.day) ||
      day.endDate === this.day.day;

    if (conditionOk)
      this.day.period = { checkIn: day.startDate, checkOut: day.endDate };
  }

  private setBookingId(day: Required<Period>) {
    const conditionOk =
      day.startDate === this.day.day ||
      checkBetweenDates(day.startDate, day.endDate, this.day.day) ||
      day.endDate === this.day.day;

    if (conditionOk) this.day.id = day.id;
  }

  private setBookingContractInfo(day: BookingInfo) {
    if (day.type === "contract") {
      const { startDate, endDate } = day;
      const conditionOk =
        startDate === this.day.day ||
        checkBetweenDates(startDate, endDate, this.day.day) ||
        endDate === this.day.day;

      if (conditionOk) this.setContractInfo(day);
    }

    return this;
  }

  private setBookingComment(day: BookingInfo) {
    if (day.type === "owner") {
      const { startDate, privateNote, endDate } = day;
      const conditionOk =
        startDate === this.day.day ||
        checkBetweenDates(startDate, endDate, this.day.day) ||
        endDate === this.day.day;

      if (conditionOk) this.day.privateNote = privateNote;
    }

    return this;
  }

  private setOtherType(day: Required<Period>) {
    const conditionOk =
      day.startDate === this.day.day ||
      checkBetweenDates(day.startDate, day.endDate, this.day.day) ||
      day.endDate === this.day.day;

    if (conditionOk) this.day.otherType = day.otherType;
  }

  build() {
    return { ...this.day };
  }
}
