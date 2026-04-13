import dayjs from 'dayjs'
import 'dayjs/locale/ru'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import relativeTime from 'dayjs/plugin/relativeTime'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import customParseFormat from 'dayjs/plugin/customParseFormat'

import type { DateFormatter, DateFormatterFactory, DateFormatterOptions, DateInput } from '../dateFormatterTypes'

import { DateFormat } from '../dateFormatterTypes'

// Расширяем dayjs плагинами
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(localizedFormat)
dayjs.extend(relativeTime)
dayjs.extend(customParseFormat)

export class DayjsFormatter implements DateFormatter {
  private defaultLocale: string
  private defaultTimezone: string

  constructor(options?: DateFormatterOptions) {
    this.defaultLocale = options?.locale || 'en'
    this.defaultTimezone = options?.timezone || dayjs.tz.guess()
  }

  /**
   * Преобразовать входные данные в объект dayjs
   */
  private toDayjs(date: DateInput): dayjs.Dayjs {
    let result: dayjs.Dayjs

    if (date instanceof Date) {
      result = dayjs(date)
    }
    else if (typeof date === 'number') {
      result = dayjs(date)
    }
    else if (typeof date === 'string') {
      result = dayjs(date)
    }
    else {
      result = dayjs() // По умолчанию используем текущую дату/время
    }

    return result
  }

  /**
   * Форматировать дату в соответствии с указанным форматом
   */
  format(
    date: DateInput,
    format: DateFormat = DateFormat.MEDIUM,
    options?: DateFormatterOptions,
  ): string {
    const locale = options?.locale || this.defaultLocale
    const timezone = options?.timezone || this.defaultTimezone

    let dayjsDate = this.toDayjs(date).locale(locale)

    if (timezone) {
      dayjsDate = dayjsDate.tz(timezone)
    }

    if (!dayjsDate.isValid()) {
      throw new Error('Предоставлена некорректная дата')
    }

    switch (format) {
      case DateFormat.SHORT:
        return dayjsDate.format('MM.DD.YYYY')
      case DateFormat.MEDIUM:
        return dayjsDate.format('MMM D, YYYY')
      case DateFormat.LONG:
        return dayjsDate.format('MMMM D, YYYY')
      case DateFormat.FULL:
        return dayjsDate.format('dddd, MMMM D, YYYY')
      case DateFormat.ISO:
        return dayjsDate.format('YYYY-MM-DD')
      case DateFormat.TIME_12H:
        return dayjsDate.format('hh:mm A')
      case DateFormat.TIME_24H:
        return dayjsDate.format('HH:mm')
      case DateFormat.DATETIME_SHORT:
        return dayjsDate.format('DD.MM.YYYY HH:mm')
      case DateFormat.DATETIME_LONG:
        return dayjsDate.format('MMMM D, YYYY [at] HH:mm')
      case DateFormat.RELATIVE:
        return dayjs().to(dayjsDate)
      case DateFormat.CUSTOM:
        if (!options?.customFormat) {
          throw new Error('Для пользовательского формата требуется параметр customFormat')
        }
        return dayjsDate.format(options.customFormat)
      default:
        return dayjsDate.format('MMM D, YYYY')
    }
  }

  /**
   * Преобразовать строку в объект Date
   */
  parse(dateString: string, format?: string): Date | null {
    let result: dayjs.Dayjs

    if (format) {
      result = dayjs(dateString, format)
    }
    else {
      result = dayjs(dateString)
    }

    return result.isValid() ? result.toDate() : null
  }

  /**
   * Проверить, является ли дата корректной
   */
  isValid(date: DateInput): boolean {
    return this.toDayjs(date).isValid()
  }
}

export class DayjsFormatterFactory implements DateFormatterFactory {
  createFormatter(options?: DateFormatterOptions): DateFormatter {
    return new DayjsFormatter(options)
  }
}

const defaultDayjsFormatterFactory = new DayjsFormatterFactory()
export default defaultDayjsFormatterFactory
