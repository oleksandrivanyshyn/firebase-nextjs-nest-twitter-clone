import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { algoliasearch } from 'algoliasearch';

export interface AlgoliaPost {
  objectID: string;
  id: string;
  userId: string;
  authorName: string;
  title: string;
  text: string;
  photoURL: string | null;
  likesCount: number;
  dislikesCount: number;
  commentsCount: number;
  score: number;
  createdAt: string;
}

@Injectable()
export class AlgoliaService implements OnModuleInit {
  private readonly client;
  private readonly indexName: string;

  constructor(private readonly config: ConfigService) {
    this.client = algoliasearch(
      config.get<string>('ALGOLIA_APP_ID')!.trim(),
      config.get<string>('ALGOLIA_API_KEY')!.trim(),
    );
    this.indexName = config.get<string>('ALGOLIA_INDEX_NAME') ?? 'posts';
  }

  async onModuleInit() {
    await this.client.setSettings({
      indexName: this.indexName,
      indexSettings: {
        searchableAttributes: ['title', 'text', 'authorName'],
      },
    });
  }

  async savePost(post: Omit<AlgoliaPost, 'objectID'>) {
    await this.client.saveObject({
      indexName: this.indexName,
      body: { objectID: post.id, ...post },
    });
  }

  async updatePost(
    id: string,
    data: Partial<
      Pick<
        AlgoliaPost,
        | 'title'
        | 'text'
        | 'photoURL'
        | 'authorName'
        | 'likesCount'
        | 'dislikesCount'
        | 'commentsCount'
        | 'score'
      >
    >,
  ) {
    await this.client.partialUpdateObject({
      indexName: this.indexName,
      objectID: id,
      attributesToUpdate: data as Record<string, unknown>,
    });
  }

  async deletePost(id: string) {
    await this.client.deleteObject({ indexName: this.indexName, objectID: id });
  }

  async deletePosts(ids: string[]) {
    if (!ids.length) return;
    await this.client.deleteObjects({ indexName: this.indexName, objectIDs: ids });
  }

  async search(query: string, limit = 20): Promise<AlgoliaPost[]> {
    const result = await this.client.searchSingleIndex({
      indexName: this.indexName,
      searchParams: { query, hitsPerPage: limit },
    });
    return result.hits as unknown as AlgoliaPost[];
  }
}
