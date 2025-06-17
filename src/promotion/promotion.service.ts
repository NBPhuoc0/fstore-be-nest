import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import slugify from 'slugify';
import { PromotionType } from 'src/common/enums';
import { CreatePromotionDto } from 'src/dto/req/create-promotion.dto';
import { CreateVoucherDto } from 'src/dto/req/create-voucher.dto';
import { Product, Promotion, Voucher } from 'src/entities';
import { ProductService } from 'src/product/services/product.service';
import { DataSource, In, Repository } from 'typeorm';

@Injectable()
export class PromotionService {
  constructor(private dataSource: DataSource) {}

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
  async addProductToPromotion(promotion: Promotion, productIds: number[]) {
    return await this.dataSource.manager.transaction(async (manager) => {
      const products = await manager.find(Product, {
        where: { id: In(productIds) },
      });

      const updatedProducts = products.map((product) => {
        let salePrice = product.originalPrice;

        switch (promotion.type) {
          case PromotionType.PERCENT:
            let discount = product.originalPrice * (promotion.value / 100);
            if (promotion.maxDiscount && discount > promotion.maxDiscount) {
              discount = promotion.maxDiscount;
            }
            salePrice = product.originalPrice - discount;
            break;
          case PromotionType.AMOUNT:
            salePrice = product.originalPrice - promotion.value;
            break;
          case PromotionType.FLAT:
            salePrice = promotion.value;
            break;
        }

        if (salePrice < 0) salePrice = 0;

        return {
          ...product,
          promotionId: promotion.id,
          promotion: promotion,
          salePrice: Math.round(salePrice),
        };
      });

      await manager.save(Product, updatedProducts);
    });
  }

  // xóa sản phẩm khỏi khuyến mãi
  async removePromotionFromProducts(productIds: number[]) {
    return await Product.update(
      { id: In(productIds) },
      { promotionId: null, salePrice: null, promotion: null },
    );
  }

  // tắt khuyến mãi
  async disablePromotion(promotionId: number) {
    await Promotion.update({ id: promotionId }, { status: false });
    const promo = await Promotion.findOne({
      where: { id: promotionId },
      relations: ['products'],
    });
    if (promo) {
      let productIds = promo.products.map((product) => product.id);
      await this.removePromotionFromProducts(productIds);
    }
    return;
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
    this.addProductToPromotion(promo, productIds);
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
    // voucher = slugify(dto.name, { lower: true });
    return Voucher.save(voucher);
  }

  // xoá voucher
  async removeVoucher(id: number) {
    return Voucher.delete({
      id: id,
    });
  }

  // tắt voucher
  async changeState(voucherId: number) {
    const voucher = await Voucher.findOneBy({ id: voucherId });
    if (!voucher) {
      throw new Error('Voucher not found');
    }
    voucher.status = !voucher.status; // toggle status
    return Voucher.save(voucher);
  }

  // bật voucher
  async enableVoucher(voucherId: number) {
    return Voucher.update({ id: voucherId }, { status: true });
  }
}
