import type { DateFormatter, DateFormatterFactory, DateFormatterOptions } from './dateFormatterTypes.ts'

import { DateFormat } from './dateFormatterTypes.ts'
import defaultDayjsFormatterFactory from './dayjs/dayjsFormatter.ts'

/**
 * Одиночный сервис форматирования даты, который управляет текущей реализацией форматирования
 */
class DateFormatterService {
  private static instance: DateFormatterService
  private formatterFactory: DateFormatterFactory
  private defaultFormatter: DateFormatter

  private constructor(factory: DateFormatterFactory) {
    this.formatterFactory = factory
    this.defaultFormatter = factory.createFormatter()
  }

  /**
   * Получить единственный экземпляр сервиса форматирования
   */
  public static getInstance(): DateFormatterService {
    if (!DateFormatterService.instance) {
      // По умолчанию используем реализацию Day.js
      DateFormatterService.instance = new DateFormatterService(defaultDayjsFormatterFactory)
    }

    return DateFormatterService.instance
  }

  /**
   * Установить новую реализацию фабрики форматирования
   * Это позволяет переключать используемую библиотеку работы с датами
   */
  public setFormatterFactory(factory: DateFormatterFactory): void {
    this.formatterFactory = factory
    this.defaultFormatter = factory.createFormatter()
  }

  /**
   * Получить экземпляр форматирования по умолчанию
   */
  public getFormatter(): DateFormatter {
    return this.defaultFormatter
  }

  /**
   * Создать новый форматтер с определенными опциями
   */
  public createFormatter(options: DateFormatterOptions): DateFormatter {
    return this.formatterFactory.createFormatter(options)
  }

  /**
   * Получить сегодняшнюю дату в формате YYYY-MM-DD
   */
  public getTodayISO(): string {
    return this.defaultFormatter.format(new Date(), DateFormat.ISO)
  }
}

export const dateFormatterService = DateFormatterService.getInstance()
export const dateFormatter = dateFormatterService.getFormatter()
