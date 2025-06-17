export enum OrderPaymentMethod {
  COD = 'COD',
  BANKING = 'BANKING',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  DELIVERING = 'DELIVERING',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  RETURN_PROCESSING = 'RETURN_PROCESSING',
  RETURNED = 'RETURNED',
  EXCHANGED = 'EXCHANGED',
  WAITING_REFUND = 'WAITING_REFUND',
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

export enum TicketType {
  RETURNED = 'RETURNED',
  EXCHANGE = 'EXCHANGE',
  COMPLAINT = 'COMPLAINT',
  OTHERS = 'OTHERS',
}

export enum TicketStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
}
