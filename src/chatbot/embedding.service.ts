import { Injectable } from '@nestjs/common';
@Injectable()
export class EmbeddingService {
  private readonly EMBEDDING_API: string =
    'https://phuc0201-gopfood-embedding.hf.space/embed';

  async getEmbedding(text: string): Promise<number[]> {
    const response = await fetch(this.EMBEDDING_API, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`Error fetching embedding: ${response.statusText}`);
    }

    const data = await response.json();
    return data.embedding;
  }
}
