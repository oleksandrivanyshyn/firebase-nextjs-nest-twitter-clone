export interface Post {
  id: string;
  userId: string;
  title: string;
  text: string;
  photoURL: string | null;
  likesCount: number;
  dislikesCount: number;
  commentsCount: number;
  score: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  text: string;
  parentCommentId: string | null;
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  surname: string;
  photoURL: string | null;
  createdAt: string | null;
}

export interface PaginatedPosts {
  posts: Post[];
  nextCursor: string | null;
}
