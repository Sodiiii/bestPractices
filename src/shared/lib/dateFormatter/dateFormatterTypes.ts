/**
 * Определяет стандартные форматы даты
 */
export const DateFormat = {
  SHORT: 'SHORT', // 03.12.2025
  MEDIUM: 'MEDIUM', // Мар 12, 2025
  LONG: 'LONG', // Март 12, 2025
  FULL: 'FULL', // Среда, Март 12, 2025
  ISO: 'ISO', // 2025-03-12
  TIME_12H: 'TIME_12H', // 02:30 PM
  TIME_24H: 'TIME_24H', // 14:30
  DATETIME_SHORT: 'DATETIME_SHORT', // 03/12/2025, 14:30
  DATETIME_LONG: 'DATETIME_LONG', // Март 12, 2025 в 14:30
  RELATIVE: 'RELATIVE', // 2 дня назад, через 3 часа и т.д.
  CUSTOM: 'CUSTOM', // Для пользовательских шаблонов форматирования
} as const

export type DateFormatValue = typeof DateFormat[keyof typeof DateFormat]

/**
 * Опции для форматирования даты
 */
export interface DateFormatterOptions {
  locale?: string // Локаль (например, 'ru', 'en')
  timezone?: string // Часовой пояс (например, 'Europe/Moscow')
  customFormat?: string // Пользовательский формат (для DateFormat.CUSTOM)
}

/**
 * Типы входных данных для даты, поддерживаемые форматтером
 */
export type DateInput = Date | number | string

/**
 * Основной интерфейс для функциональности форматирования даты
 */
export interface DateFormatter {
  /**
   * Форматировать дату в соответствии с указанным форматом
   * @param date Дата для форматирования (объект Date, временная метка или строка ISO)
   * @param format Формат (из перечисления DateFormat)
   * @param options Дополнительные параметры форматирования
   * @returns Отформатированная строка даты
   */
  format: (
    date: DateInput,
    format?: DateFormatValue,
    options?: DateFormatterOptions,
  ) => string

  /**
   * Преобразовать строку в объект Date
   * @param dateString Строка для преобразования
   * @param format Опциональный формат, в котором представлена строка
   * @returns Объект Date или null, если невалидная дата
   */
  parse: (dateString: string, format?: string) => Date | null

  /**
   * Проверить, является ли дата корректной
   * @param date Дата для проверки
   * @returns Булево значение, указывающее, является ли дата корректной
   */
  isValid: (date: DateInput) => boolean
}

/**
 * Интерфейс фабрики для создания экземпляров форматтера дат
 */
export interface DateFormatterFactory {
  /**
   * Создать форматтер с указанными опциями
   * @param options Опции для форматирования
   * @returns Экземпляр DateFormatter
   */
  createFormatter: (options?: DateFormatterOptions) => DateFormatter
}
