export const routes = {
  root: { path: '/', title: 'root' },
  home: { path: '/', title: 'Главная' },
  editor: { path: '/editor', title: 'Пример редактора текста' },
  page404: { path: '/', title: 'Страница не найдена' },

  post: {
    root: { path: '/post', title: 'Пример таблицы' },
    byPostId: (id: string) => ({ path: `/post/${id}/`, title: 'Пост' }),
  },

} as const
