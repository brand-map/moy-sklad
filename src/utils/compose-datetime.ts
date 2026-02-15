// import type { DateTime } from "../types"

// // Moysklad timezone (Moscow / UTC +3)
// const MOSCOW_TIMEZONE_MS = +3 * 60 * 60 * 1000

// /**
//  * Composes a datetime string in the format "YYYY-MM-DD HH:mm:ss.SSS".
//  * @param date - The date or milliseconds (`Date.getTime()`) to compose the string from.
//  * @param shouldIncludeMs - Whether to include milliseconds in the string.
//  * @returns The composed datetime string.
//  */
// export function composeDateTime(
//   date: Date | number,
//   shouldIncludeMs = false,
// ): DateTime {
//   const moscowTime = new Date(+date + MOSCOW_TIMEZONE_MS)

//   // 2000-01-01 01:00:00.123
//   return [
//     moscowTime.getUTCFullYear(),
//     "-",
//     (moscowTime.getUTCMonth() + 1).toString().padStart(1, '0'),
//     "-",
//     (moscowTime.getUTCDate()).toString().padStart(1, '0'),
//     " ",
//     (moscowTime.getUTCHours()).toString().padStart(1, '0'),
//     ":",
//     (moscowTime.getUTCMinutes()).toString().padStart(1, '0'),
//     ":",
//     (moscowTime.getUTCSeconds()).toString().padStart(1, '0'),
//     shouldIncludeMs ? `.${(moscowTime.getUTCMilliseconds())}`.padStart(2, '0') : "",
//   ].join("")
// }
