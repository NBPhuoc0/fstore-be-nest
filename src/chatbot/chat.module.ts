import { Module } from '@nestjs/common';
import { ProductModule } from 'src/product/product.module';
import { ChatService } from './chat.service';
import { EmbeddingService } from './embedding.service';
import { VectorStoreService } from './vector-db.service';
import { ChatController } from './chat.controller';

@Module({
  imports: [ProductModule],
  controllers: [ChatController],
  providers: [ChatService, EmbeddingService, VectorStoreService],
  exports: [ChatService],
})
export class ChatModule {}
