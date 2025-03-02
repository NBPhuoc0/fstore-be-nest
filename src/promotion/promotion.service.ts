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
  // lấy tất cả khuyến mãi
  async getPromotions() {
    return Promotion.find();
  }

  // lấy thông tin khuyến mãi theo id
  async getPromotionById(id: number) {
    return Promotion.findOneBy({ id });
  }

  // tạo mới khuyến mãi
  async createPromotion(dto: CreatePromotionDto) {
    const promotion = Promotion.create({ ...dto });
    promotion.urlHandle = slugify(dto.name, { lower: true });
    return Promotion.save(promotion);
  }

  // thêm sản phẩm vào khuyến mãi
  async addProductToPromotion(promotionId: number, productIds: number[]) {
    return await Product.update({ id: In(productIds) }, { promotionId });
  }

  // xóa sản phẩm khỏi khuyến mãi
  async removeProductFromPromotion(promotionId: number, productIds: number[]) {
    return await Product.update({ id: In(productIds) }, { promotionId: null });
  }

  // tắt khuyến mãi
  async disablePromotion(promotionId: number) {
    await Promotion.update({ id: promotionId }, { status: false });
    return Product.update({ promotionId }, { promotionId: null });
  }

  // bật khuyến mãi
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

  // xóa khuyến mãi
  async removePromotion(promotionId: number) {
    return Promotion.delete({ id: promotionId });
  }

  //**Voucher */
  // lấy tất cả voucher
  async getVouchers() {
    return Voucher.find();
  }

  // lấy thông tin voucher theo id
  async getVoucherById(id: number) {
    return Voucher.findOneBy({ id });
  }

  // tạo mới voucher
  async createVoucher(dto: CreateVoucherDto) {
    const voucher = Voucher.create({ ...dto });
    voucher.code = slugify(dto.name, { lower: true });
    return Voucher.save(voucher);
  }

  // xoá voucher
  async removeVoucher(voucherId: number) {
    return Voucher.delete({
      id: voucherId,
    });
  }

  // tắt voucher
  async disableVoucher(voucherId: number) {
    return Voucher.update({ id: voucherId }, { status: false });
  }

  // bật voucher
  async enableVoucher(voucherId: number) {
    return Voucher.update({ id: voucherId }, { status: true });
  }
}
