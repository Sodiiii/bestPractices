export const routes = {
  root: { path: '/', title: 'root' },
  home: { path: '/', title: 'Главная' },
  slide: {
    path: '/slides/:slideId',
    title: 'Слайд',
    build: (slideId: string) => `/slides/${slideId}`,
  },
  page404: { path: '*', title: 'Страница не найдена' },
} as const
