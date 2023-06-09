import { Dayjs } from "dayjs";
import { dateHandler } from "./date";

export type PeriodType =
  | "weekly_by_sunday"
  | "weekly_by_monday"
  | "weekly_by_tuesday"
  | "weekly_by_wednesday"
  | "weekly_by_thursday"
  | "weekly_by_friday"
  | "weekly_by_saturday";

export type DayRuleType = "nightly" | PeriodType;

type PeriodRulesValidatorInput = {
  startAt: { date: string; dayRule: DayRuleType; mininumDuration: number };
  endAt: { date: string; dayRule: DayRuleType; mininumDuration: number };
};

const NB_DAYS_OF_ONE_WEEK = 7;

const WEEKLY_DAYS_NUMBER = {
  weekly_by_sunday: 0,
  weekly_by_monday: 1,
  weekly_by_tuesday: 2,
  weekly_by_wednesday: 3,
  weekly_by_thursday: 4,
  weekly_by_friday: 5,
  weekly_by_saturday: 6,
};

const getMinimumDurationDays = (mininumDuration: number) =>
  NB_DAYS_OF_ONE_WEEK * mininumDuration;

const getPreviousMonthDays = (totalDays: number, mininumDuration: number) =>
  totalDays - mininumDuration;

const dateAtRuleIsOk = (
  date: Dayjs,
  dateAt: PeriodRulesValidatorInput["startAt"]
) => {
  const refDate = date.get("day");
  const refDay = WEEKLY_DAYS_NUMBER[dateAt.dayRule as PeriodType];

  if (dateAt.dayRule.includes("weekly")) return refDate === refDay;

  return true;
};

const getDiffDays = (
  input: PeriodRulesValidatorInput & { startDate: Dayjs; endDate: Dayjs }
) => {
  const { startAt, endAt, startDate, endDate } = input;
  const startMonth = startDate.get("month");
  const endMonth = endDate.get("month");
  const endYear = endDate.get("year");
  const firstDateOfEndMonth = `${endYear}-${endMonth + 1}-01`;

  if (startMonth !== endMonth && startAt.dayRule !== endAt.dayRule)
    return endDate.diff(firstDateOfEndMonth, "days");

  return endDate.diff(startDate, "days");
};

const isWeekly = (input: PeriodRulesValidatorInput) =>
  input.startAt.dayRule.includes("weekly") &&
  input.endAt.dayRule.includes("weekly");

const getMinimunDuration = (input: PeriodRulesValidatorInput) => {
  const { startAt, endAt } = input;
  const hasWeeklyRules = isWeekly({ startAt, endAt });
  const isWeeklyRuleDiff = hasWeeklyRules && startAt.dayRule !== endAt.dayRule;
  const isSameRule = startAt.dayRule === endAt.dayRule;

  if (isSameRule || isWeeklyRuleDiff)
    return Math.max(startAt.mininumDuration, endAt.mininumDuration);

  return endAt.mininumDuration;
};

const nightlyRuleValidator = (
  nbDays: number,
  input: PeriodRulesValidatorInput & { startDate: Dayjs }
) => {
  const { startAt, endAt, startDate } = input;
  const nbDiffDayCondition = nbDays >= getMinimunDuration({ startAt, endAt });
  const startAtIsOk = dateAtRuleIsOk(startDate, startAt);

  return startAtIsOk && nbDiffDayCondition;
};

const weeklyRuleValidator = (
  nbDays: number,
  input: PeriodRulesValidatorInput & { startDate: Dayjs; endDate: Dayjs }
) => {
  const { startAt, endAt, startDate, endDate } = input;
  const mininumDuration = getMinimunDuration({ startAt, endAt });
  const minimumDays = getMinimumDurationDays(mininumDuration);
  const nbPreviousMonthDays = getPreviousMonthDays(nbDays, minimumDays);
  const nbPreviousMonthDaysCondition = nbPreviousMonthDays >= 0;
  const rulesOfMinimumDays = nbDays - nbPreviousMonthDays === minimumDays;
  const startAtIsOk = dateAtRuleIsOk(startDate, startAt);
  const endAtIsOk = dateAtRuleIsOk(endDate, endAt);

  return (
    startAtIsOk &&
    nbPreviousMonthDaysCondition &&
    endAtIsOk &&
    rulesOfMinimumDays
  );
};

export const periodRulesValidator = (input: PeriodRulesValidatorInput) => {
  const { startAt, endAt } = input;
  const dayRule = endAt.dayRule;
  const endDate = dateHandler({ date: endAt.date });
  const startDate = dateHandler({ date: startAt.date });
  const nbDays = getDiffDays({ ...input, startDate, endDate });

  if (dayRule.includes("weekly"))
    return weeklyRuleValidator(nbDays, { ...input, startDate, endDate });

  return nightlyRuleValidator(nbDays, { ...input, startDate });
};
