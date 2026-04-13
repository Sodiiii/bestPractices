export type ApiErrorTextKey = 'common.fetch' | 'clipboard.copy' | 'dashboard.create' | 'dashboard.delete' | 'dashboard.list' | 'dashboard.open' | 'dashboard.openDeepLink' | 'dashboard.save' | 'dataset.create' | 'dataset.delete' | 'dataset.list' | 'dataset.select' | 'dataset.uploadExcel' | 'dataset.uploadSql' | 'filter.values' | 'widget.data'

interface ApiErrorTextEntry {
  fallbackMessage: string
  accessDeniedMessage?: string
}

export const apiErrorTextRegistry: Record<ApiErrorTextKey, ApiErrorTextEntry> = {
  'common.fetch': {
    fallbackMessage: 'Произошла ошибка при загрузке данных.',
    accessDeniedMessage: 'Доступ к данным запрещён.',
  },
  'clipboard.copy': {
    fallbackMessage: 'Попробуйте ещё раз.',
  },
  'dashboard.create': {
    fallbackMessage: 'Ошибка при создании проекта.',
    accessDeniedMessage: 'Нет прав на создание проекта.',
  },
  'dashboard.delete': {
    fallbackMessage: 'Не удалось удалить проект.',
    accessDeniedMessage: 'Нет прав на удаление проекта.',
  },
  'dashboard.list': {
    fallbackMessage: 'Не удалось загрузить список проектов.',
    accessDeniedMessage: 'Нет доступа к проектам выбранного датасета.',
  },
  'dashboard.open': {
    fallbackMessage: 'Не удалось открыть проект.',
    accessDeniedMessage: 'Нет доступа к выбранному проекту.',
  },
  'dashboard.openDeepLink': {
    fallbackMessage: 'Не удалось открыть проект.',
    accessDeniedMessage: 'Нет доступа к этому проекту.',
  },
  'dashboard.save': {
    fallbackMessage: 'Не удалось сохранить изменения.',
    accessDeniedMessage: 'Нет прав на сохранение проекта.',
  },
  'dataset.create': {
    fallbackMessage: 'Попробуйте повторить позже.',
    accessDeniedMessage: 'Нет прав на создание датасета.',
  },
  'dataset.delete': {
    fallbackMessage: 'Не удалось удалить датасет.',
    accessDeniedMessage: 'Нет прав на удаление датасета.',
  },
  'dataset.list': {
    fallbackMessage: 'Не удалось загрузить список датасетов.',
    accessDeniedMessage: 'Нет доступа к списку датасетов.',
  },
  'dataset.select': {
    fallbackMessage: 'Не удалось выбрать датасет.',
  },
  'dataset.uploadExcel': {
    fallbackMessage: 'Не удалось обработать файл.',
    accessDeniedMessage: 'Нет прав на загрузку датасета из Excel.',
  },
  'dataset.uploadSql': {
    fallbackMessage: 'Не удалось загрузить метаданные таблицы.',
    accessDeniedMessage: 'Нет прав на загрузку датасета из базы данных.',
  },
  'filter.values': {
    fallbackMessage: 'Не удалось загрузить значения фильтра.',
    accessDeniedMessage: 'Нет доступа к значениям этого фильтра.',
  },
  'widget.data': {
    fallbackMessage: 'Не удалось загрузить данные виджета.',
    accessDeniedMessage: 'Нет доступа к данным этого виджета.',
  },
}

export function getApiErrorText(
  key: ApiErrorTextKey,
  variant: 'fallback' | 'accessDenied' = 'fallback',
): string {
  const entry = apiErrorTextRegistry[key]

  if (variant === 'accessDenied')
    return entry.accessDeniedMessage ?? 'Доступ запрещён.'

  return entry.fallbackMessage
}
