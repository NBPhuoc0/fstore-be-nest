import { GoogleGenAI } from '@google/genai';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatSession, suggestPayload } from 'src/common/types';
import { Product } from 'src/entities';
import { ProductService } from 'src/product/services/product.service';
import { v4 } from 'uuid';
import { EmbeddingService } from './embedding.service';
import { FashionBotPolicy } from './prompts';
import { VectorStoreService } from './vector-db.service';

@Injectable()
export class ChatService {
  private ai: GoogleGenAI;

  private chatSessions: Map<string, ChatSession> = new Map();
  constructor(
    private readonly configService: ConfigService,
    private readonly vertorStoreService: VectorStoreService,
    private readonly embeddingService: EmbeddingService,
    private readonly productService: ProductService,
  ) {
    this.ai = new GoogleGenAI({
      apiKey: this.configService.get('GEMINI_API_KEY'),
    });
  }

  async streamChat() {
    const session = await this.ai.live.connect({
      model: 'gemini-2.0-flash',
      callbacks: {
        onopen: () => {
          console.log('Connected to the socket.');
        },
        onmessage: (message) => {
          console.log('Received message:', message);
        },
        onerror: (error) => {
          console.error('Error:', error);
        },
        onclose: (e: CloseEvent) => {
          console.log('Connection closed.');
        },
      },
    });

    return session;
  }

  async importDatatoVectorStore() {
    await this.vertorStoreService.createCollection();

    const products = await this.productService.getAllProducts();
    const points: {
      id: string;
      vector: number[];
      payload: suggestPayload;
    }[] = [];

    for (const product of products) {
      const embedText =
        product.name +
        ' ' +
        product.category.name +
        ' ' +
        product.colors.map((color) => {
          return color.name + ' ';
        });
      Logger.log(embedText, 'ChatService');
      const embedding = await this.embeddingService.getEmbedding(embedText);
      points.push({
        id: v4(),
        vector: embedding,
        payload: {
          id: product.id,
          name: product.name,
          //   description: product.metaDesc,
          price: product.originalPrice,
          category: product.category.name,
          brand: product.brand.name,
          color: product.colors.map((color) => color.name),
          size: product.sizes.map((size) => size.name),
        },
      });
    }

    return await this.vertorStoreService.upsertVector(points);
  }

  async upsertData(product: Product) {
    const points: {
      id: string;
      vector: number[];
      payload: suggestPayload;
    }[] = [];
    const embedText =
      product.name +
      ' ' +
      product.category.name +
      ' ' +
      product.colors.map((color) => {
        return color.name + ' ';
      });
    Logger.log(embedText, 'ChatService');
    const embedding = await this.embeddingService.getEmbedding(embedText);
    points.push({
      id: v4(),
      vector: embedding,
      payload: {
        id: product.id,
        name: product.name,
        //   description: product.metaDesc,
        price: product.originalPrice,
        category: product.category.name,
        brand: product.brand.name,
        color: product.colors.map((color) => color.name),
        size: product.sizes.map((size) => size.name),
      },
    });
    return await this.vertorStoreService.upsertVector(points);
  }

  async suggestProducts(query: string): Promise<suggestPayload[]> {
    const embedding = await this.embeddingService.getEmbedding(query);
    const results = await this.vertorStoreService.searchVector(embedding);

    const products = new Map<string, any>();

    results.forEach((result) => {
      const prodId = result.payload.id as string;
      if (prodId) {
        if (!products.has(prodId)) {
          products.set(prodId, {
            id: prodId,
            name: result.payload.name,
            // description: result.payload.description,
            price: result.payload.price,
            category: result.payload.category,
            brand: result.payload.brand,
            color: result.payload.color,
            size: result.payload.size,
          });
        }
      }
    });

    return Array.from(products.values());
  }
  extractJsonString(input: string): string {
    const match = input.match(/{[\s\S]*}/);
    return match ? match[0] : '{}';
  }
  async sendMessage(id: string, message: string): Promise<any> {
    const suggest = await this.suggestProducts(message);
    const chatSession = this.chatSessions.get(id);
    if (!chatSession) {
      const prompts = `
              ${FashionBotPolicy.policy}
              ${FashionBotPolicy.format_response}
              **Danh sách sản phẩm gốc:**
              ${JSON.stringify(suggest.map((prod) => prod))}
              ***********************
              Dựa vào danh sách sản phẩm để tìm ra sản phẩm có phù hợp với yêu cầu của khách
              Nếu danh sách rỗng thì hãy đưa ra một vài đề xuất cho khách chọn
              Câu hỏi mới của người dùng: ${message}
            `;

      const session = this.ai.chats.create({
        model: 'gemini-2.0-flash',
        config: {
          temperature: 0.5,
        },
      });

      const response = await session.sendMessage({ message: prompts });
      const parsedResponse = JSON.parse(this.extractJsonString(response.text));

      this.chatSessions.set(id, {
        chat: session,
        lastActivity: new Date(),
      });

      const products = await this.productService.getProductsByIds(
        parsedResponse.products,
      );

      return {
        message: parsedResponse.message,
        products: products,
        temp: suggest,
      };
    } else {
      const prompts = `
              **Thêm các sản phẩm sau vào danh sách sản phẩm gốc:**
              ${JSON.stringify(suggest.map((prod) => prod))}
              ******************************************
              Dựa vào danh sách sản phẩm và và các sản phẩm khác trong lịch sử trò chuyện để đưa ra đề xuất cho người dùng
              Câu hỏi mới của người dùng: ${message}
            `;
      const response = await chatSession.chat.sendMessage({
        message: prompts,
      });
      const parsedResponse = JSON.parse(this.extractJsonString(response.text));

      this.chatSessions.set(id, {
        ...chatSession,
        lastActivity: new Date(),
      });

      const products = await this.productService.getProductsByIds(
        parsedResponse.products,
      );

      return {
        message: parsedResponse.message,
        products: products,
      };
    }
  }
}
