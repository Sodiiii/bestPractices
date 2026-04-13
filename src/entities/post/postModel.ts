export enum PostStatus {
  REVIEWING = 0,
  PUBLISHED = 1,
  DELETED = 2,
}

export type AuthorDto = {
  id: string
  first_name: string
  last_name: string
  middle_name: string
}

export type Author = {
  id: string
  firstName: string
  lastName: string
  middleName: string
}

export type PostDto = {
  id: string
  title: string
  description: string
  created_at: string
  status: PostStatus
  author: AuthorDto
}

export type Post = {
  id: string
  title: string
  description: string
  createdAt: string
  status: PostStatus
  author: Author
}
