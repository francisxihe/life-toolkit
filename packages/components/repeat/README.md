# Repeat Component

`@true-north/components-repeat` provides the shared React selector and deterministic calendar algorithms used by repeatable work across the product.

## Public API

```tsx
import { createDefaultRepeatSetting, RepeatSelector } from '@true-north/components-repeat';
import type { RepeatSelectorValue } from '@true-north/components-repeat';
import type { RepeatPayload } from '@true-north/components-repeat/types';
import { calculateNextDate, isValidDate } from '@true-north/components-repeat/helpers';
```

`RepeatSelector` accepts `lang`, a complete `RepeatSelectorValue`, `onChange`, and optional `onInvalid`. `RepeatSelectorValue` includes the required `repeatStartDate` and excludes `none`. It edits enabled recurrence only; consumers use their own switch and conditional rendering to decide whether recurrence is enabled. When enabling recurrence, use `createDefaultRepeatSetting(repeatStartDate)` for the default daily, forever rule. Disabling recurrence should persist `undefined` rather than a selector value.

## Rule Shape

Every rule has `repeatStartDate`, `repeatMode`, optional mode-specific `repeatConfig`, and `repeatEndMode`. `forever` has no further value; `forTimes` requires a positive `repeatTimes`; `toDate` requires an ISO `repeatEndDate`.

The selector supports `daily`, `weekdays`, `weekend`, `workdays`, `restDay`, `weekly`, `monthly`, `yearly`, and `custom`. `none` remains supported by the parser and date algorithms for existing persisted one-off rules, but is not an interactive selector option. Weekly rules use weekday values 1 through 7 for Monday through Sunday. Monthly and yearly rules support calendar dates, ordinal weekdays, and ordinal working/rest days. Custom rules use a positive interval with day, week, month, or year units and may add the corresponding nested rule configuration.

## Calendar Semantics

`isValidDate(date, rule)` returns whether the supplied local calendar date belongs to the rule. It rejects dates before `repeatStartDate` and, for `toDate`, dates after the end date. `calculateNextDate(currentDate, rule)` returns the strictly next valid date or `null` for a non-repeating rule. Both functions first parse and validate the rule and return validation issues instead of silently guessing configuration.

`workdays` and `restDay` use `chinese-holiday-calendar`, rather than a weekday-only approximation. Consumers must treat dates as local `YYYY-MM-DD` values and pass a complete `RepeatPayload`.

## Consumer Lifecycle

The component does not create records. Consumers keep a repeat template and one current instance. The initial instance counts as the first occurrence. On completion, explicit non-completion, or an overdue settlement, increment the settled count, stop when the configured count or end date has been reached, otherwise calculate the next valid date. If an overdue template has fallen behind, settle it once and advance to the first valid date on or after today; do not pre-generate skipped instances.

## Verification

The package test suite covers parsing, ordinal rules, yearly rules, and next-date calculation. Consumers should add lifecycle tests for their own persistence and status transitions.
