// src/shipping/dto/create-shipping-order.dto.ts

export class ShippingItemDto {
  id: number;
  name: string;
  code: string;
  quantity: number;
  price: number;
  weight: number;
  length: number;
  width: number;
  height: number;
}

export class CreateShippingOrderDto {
  from_address: string = '1 võ văn ngân';
  from_district_id: number = 3695; // Quận Thủ Đức
  from_ward_code: string = '90742';
  from_phone: string = '0333495017';
  from_name: string = '0333495017';

  length: number; // 10 cm x sl
  width: number; // 10 cm x sl
  height: number; // 10 cm x sl
  weight: number; // 1000 gram x sl

  items: ShippingItemDto[];

  cod_amount: number; // giá trị thu hộ
  insurance_value: number; // giá tri thật đơn hàng

  pick_shift: number[] = [2];

  to_phone: string;
  to_name: string;
  to_address: string;
  to_district_id: number;
  to_ward_code: string;

  required_note: string = 'CHOXEMHANGKHONGTHU';
  service_type_id: number = 2; //
  payment_type_id: number; // Ex: 1 shop, 2 khách
}
