import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import slugify from 'slugify';
import { CreatePromotionDto } from 'src/dto/req/create-promotion.dto';
import { CreateVoucherDto } from 'src/dto/req/create-voucher.dto';
import { Product, Promotion, Voucher } from 'src/entities';
import { ProductService } from 'src/product/services/product.service';
import { In, Repository } from 'typeorm';

@Injectable()
export class PromotionService {
  constructor(
    @InjectRepository(Promotion)
    private promotionRepository: Repository<Promotion>,
    @InjectRepository(Voucher)
    private promotionItemRepository: Repository<Voucher>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private productService: ProductService,
  ) {}

  //**Products Promotion */
  async getPromotions() {
    return this.promotionRepository.find();
  }

  async getPromotionById(id: number) {
    return this.promotionRepository.findOneBy({ id });
  }

  async createPromotion(dto: CreatePromotionDto) {
    const promotion = this.promotionRepository.create(dto);
    promotion.urlHandle = slugify(dto.name, { lower: true });
    return this.promotionRepository.save(promotion);
  }

  async addProductToPromotion(promotionId: number, productIds: number[]) {
    return await this.productRepository.update(
      { id: In(productIds) },
      { promotionId },
    );
  }

  async removeProductFromPromotion(promotionId: number, productIds: number[]) {
    return await this.productRepository.update(
      { id: In(productIds) },
      { promotionId: null },
    );
  }

  async disablePromotion(promotionId: number) {
    await this.promotionRepository.update(
      { id: promotionId },
      { status: false },
    );
    return this.productRepository.update(
      { promotionId },
      { promotionId: null },
    );
  }

  async enablePromotion(promotionId: number) {
    const promo = await this.promotionRepository.findOne({
      where: { id: promotionId },
      relations: ['products'],
    });

    promo.status = true;
    promo.save();
    let productIds = promo.products.map((product) => product.id);
    this.addProductToPromotion(promo.id, productIds);
    return;
  }

  async removePromotion(promotionId: number) {
    return this.promotionRepository.delete({ id: promotionId });
  }

  //**Voucher */

  async getVouchers() {
    return this.promotionItemRepository.find();
  }

  async getVoucherById(id: number) {
    return this.promotionItemRepository.findOneBy({ id });
  }

  async createVoucher(dto: CreateVoucherDto) {
    const voucher = this.promotionItemRepository.create(dto);
    voucher.code = slugify(dto.name, { lower: true });
    return this.promotionItemRepository.save(voucher);
  }

  async removeVoucher(voucherId: number) {
    return this.promotionItemRepository.delete({
      id: voucherId,
    });
  }

  async disableVoucher(voucherId: number) {
    return this.promotionItemRepository.update(
      { id: voucherId },
      { status: false },
    );
  }

  async enableVoucher(voucherId: number) {
    return this.promotionItemRepository.update(
      { id: voucherId },
      { status: true },
    );
  }
}
