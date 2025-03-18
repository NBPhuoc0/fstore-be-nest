export enum OrderPaymentMethod {
  COD = 'COD',
  BANKING = 'BANKING',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum VoucherType {
  PERCENT = 'PERCENT',
  AMOUNT = 'AMOUNT',
}

export enum PromotionType {
  PERCENT = 'PERCENT',
  AMOUNT = 'AMOUNT',
  FLAT = 'FLAT',
}

export enum CachePatterns {
  ProductViewDaily = 'product_view_daily',
  ProductViewWeekly = 'product_view_weekly',
  ProductViewMonthly = 'product_view_monthly',
  Product = 'product',
}
