import type { GetPosts, GetPostsDto } from './getPostsModel'

export function transformGetPostsDtoToGetPosts(getPostDto: GetPostsDto): GetPosts {
  const posts = getPostDto.posts.map(post => ({
    id: post.id,
    title: post.title,
    description: post.description,
    createdAt: post.created_at,
    status: post.status,
    author: {
      id: post.author.id,
      firstName: post.author.first_name,
      lastName: post.author.last_name,
      middleName: post.author.middle_name,
    },
  }))

  return {
    posts,
  }
}
