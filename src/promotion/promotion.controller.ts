import { Body, Controller, Get, Post } from '@nestjs/common';
import { PromotionService } from './promotion.service';
import { CreatePromotionDto } from 'src/dto/req/create-promotion.dto';

@Controller('promotions')
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) {}

  @Get()
  async getAllPromotions() {
    return this.promotionService.getPromotions();
  }

  @Post()
  async createPromotion(@Body() dto: CreatePromotionDto) {
    return this.promotionService.createPromotion(dto);
  }
}
