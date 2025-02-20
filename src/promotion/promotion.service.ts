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
  constructor() {}

  //**Products Promotion */
  async getPromotions() {
    return Promotion.find();
  }

  async getPromotionById(id: number) {
    return Promotion.findOneBy({ id });
  }

  async createPromotion(dto: CreatePromotionDto) {
    const promotion = Promotion.create({ ...dto });
    promotion.urlHandle = slugify(dto.name, { lower: true });
    return Promotion.save(promotion);
  }

  async addProductToPromotion(promotionId: number, productIds: number[]) {
    return await Product.update({ id: In(productIds) }, { promotionId });
  }

  async removeProductFromPromotion(promotionId: number, productIds: number[]) {
    return await Product.update({ id: In(productIds) }, { promotionId: null });
  }

  async disablePromotion(promotionId: number) {
    await Promotion.update({ id: promotionId }, { status: false });
    return Product.update({ promotionId }, { promotionId: null });
  }

  async enablePromotion(promotionId: number) {
    const promo = await Promotion.findOne({
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
    return Promotion.delete({ id: promotionId });
  }

  //**Voucher */

  async getVouchers() {
    return Voucher.find();
  }

  async getVoucherById(id: number) {
    return Voucher.findOneBy({ id });
  }

  async createVoucher(dto: CreateVoucherDto) {
    const voucher = Voucher.create({ ...dto });
    voucher.code = slugify(dto.name, { lower: true });
    return Voucher.save(voucher);
  }

  async removeVoucher(voucherId: number) {
    return Voucher.delete({
      id: voucherId,
    });
  }

  async disableVoucher(voucherId: number) {
    return Voucher.update({ id: voucherId }, { status: false });
  }

  async enableVoucher(voucherId: number) {
    return Voucher.update({ id: voucherId }, { status: true });
  }
}
