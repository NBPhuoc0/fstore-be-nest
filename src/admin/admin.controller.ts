import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  UploadedFile,
  Logger,
  UseGuards,
  Req,
  HttpException,
  Put,
  Query,
  BadRequestException,
  Res,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { ProductService } from 'src/product/services/product.service';
import { ProductUtilsService } from 'src/product/services/product-utils.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateProdDto } from 'src/dto/req/create-prod.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { createCateDto } from 'src/dto/req/create-cate.dto';
import { createColorDto } from 'src/dto/req/create-color.dto';
import { S3ClientService } from 'src/common/services/s3-client.service';
import { AdminAuthGuard } from 'src/auth/guards/admin.auth.guard';
import { CreatePromotionDto } from 'src/dto/req/create-promotion.dto';
import { PromotionService } from 'src/promotion/promotion.service';
import { OrderService } from 'src/order/services/order.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InventoryService } from 'src/inventory/inventory.service';
import { UpdateProdDto } from 'src/dto/req/update-prod.dto';
import { TicketService } from 'src/order/services/ticket.service';
import { TicketStatus } from 'src/common/enums';
import { ImportBatchDto, InventoryActionDto } from 'src/dto/req/inventory.dto';
import { InventoryTransactionType } from 'src/entities/inventory-transaction.entity';
import { ReturnOrderDto } from 'src/dto/req/return-order.dto';
import { CreateVoucherDto } from 'src/dto/req/create-voucher.dto';
import { Response } from 'express';
import { fromEvent, map, Observable } from 'rxjs';

@ApiBearerAuth('Authorization')
// @UseGuards(AdminAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly productService: ProductService,
    private readonly productUtilService: ProductUtilsService,
    private readonly promotionService: PromotionService,
    private readonly orderService: OrderService,
    private readonly inventoryService: InventoryService,
    private readonly ticketService: TicketService,
    private readonly s3ClientService: S3ClientService,
    private eventEmitter: EventEmitter2,
  ) {}

  private logger = new Logger('AdminController');
  //* admin stuff
  @ApiTags('Admin')
  @Get('mock/orders')
  async mockOrders() {
    const mockOrders = await this.adminService.generateMockOrders(50);
    let i = 1;
    for (const order of mockOrders) {
      const createdOrder = await this.orderService.createOrderMock(order);
      this.logger.log(
        `${i++} Mock order created with ID: ${createdOrder.id}, Name: ${createdOrder.name}`,
      );
    }
    return;
  }

  //* Brand...
  // get all brands
  @ApiTags('Brand')
  @Get('brands')
  findAllBrands() {
    return this.productUtilService.getBrands();
  }

  // get brand by id
  @ApiTags('Brand')
  @Get('brands/:id')
  findOneBrand(@Param('id') id: string) {
    return this.productUtilService.getBrandById(+id);
  }

  // create brand
  @ApiTags('Brand')
  @Post('brands')
  createBrand(@Body() createBrandDto: any) {
    return this.productUtilService.createBrand(createBrandDto);
  }

  // update brand by id
  @ApiTags('Brand')
  @Patch('brands/:id')
  updateBrand(@Body() updateBrandDto: any, @Param('id') id: string) {
    return this.productUtilService.updateBrand(+id, updateBrandDto);
  }

  // delete brand by id
  @ApiTags('Brand')
  @Delete('brands/:id')
  removeBrand(@Param('id') id: string) {
    return this.productUtilService.deleteBrand(+id);
  }

  //* Category

  // get all categories
  @ApiTags('Category')
  @Get('categories')
  findAllCategories() {
    return this.productUtilService.getCategories();
  }

  // get category by id
  @ApiTags('Category')
  @Get('categories/:id')
  findOneCategory(@Param('id') id: string) {
    return this.productUtilService.getCategoryById(+id);
  }

  // create category
  @ApiTags('Category')
  // @UseGuards(AdminAuthGuard)
  @Post('categories')
  createCategory(@Body() createCategoryDto: createCateDto) {
    return this.productUtilService.createCategory(createCategoryDto);
    // throw new HttpException('Not implemented', 500);
  }

  // update category by id
  @ApiTags('Category')
  @Patch('categories/:id')
  updateCategory(@Body() updateCategoryDto: any, @Param('id') id: string) {
    return this.productUtilService.updateCategory(+id, updateCategoryDto);
  }

  // delete category by id
  @ApiTags('Category')
  @Delete('categories/:id')
  removeCategory(@Param('id') id: string) {
    return this.productUtilService.deleteCategory(+id);
  }

  //* Color

  // get all colors
  @ApiTags('Color')
  @Get('colors')
  findAllColors() {
    return this.productUtilService.getColors();
  }

  // get color by id
  @ApiTags('Color')
  @Get('colors/:id')
  findOneColor(@Param('id') id: string) {
    return this.productUtilService.getColorById(+id);
  }

  // create color
  @ApiTags('Color')
  @Post('colors')
  createColor(@Body() createColorDto: any) {
    return this.productUtilService.createColor(createColorDto);
  }

  // update color by id
  @ApiTags('Color')
  @Patch('colors/:id')
  updateColor(@Body() updateColorDto: any, @Param('id') id: string) {
    return this.productUtilService.updateColor(+id, updateColorDto);
  }

  // delete color by id
  @ApiTags('Color')
  @Delete('colors/:id')
  removeColor(@Param('id') id: string) {
    return this.productUtilService.deleteColor(+id);
  }

  //* Size

  // get all sizes
  @ApiTags('Size')
  @Get('sizes')
  findAllSizes() {
    return this.productUtilService.getSizes();
  }

  // get size by id
  @ApiTags('Size')
  @Get('sizes/:id')
  findOneSize(@Param('id') id: string) {
    return this.productUtilService.getSizeById(+id);
  }

  // create size
  @ApiTags('Size')
  // @UseGuards(AdminAuthGuard)
  @Post('sizes')
  createSize(@Body() createSizeDto: any) {
    return this.productUtilService.createSize(createSizeDto);
  }

  // update size by id
  @ApiTags('Size')
  @Patch('sizes/:id')
  updateSize(@Body() updateSizeDto: any, @Param('id') id: string) {
    return this.productUtilService.updateSize(+id, updateSizeDto);
  }

  // delete size by id
  @ApiTags('Size')
  @Delete('sizes/:id')
  removeSize(@Param('id') id: string) {
    return this.productUtilService.deleteSize(+id);
  }

  // * Product

  // get all products
  @ApiTags('Product')
  @Get('products')
  async findAllProducts(
    @Query('current') page?: number,
    @Query('pageSize') limit?: number,
  ) {
    const { data, total } = await this.productService.getProducts(page, limit);
    return {
      data,
      total,
    };
  }

  // get product by id
  @ApiTags('Product')
  @Get('products/:id')
  findOneProduct(@Param('id') id: number) {
    return this.productService.getProductWithInventory(+id);
  }

  @ApiTags('Product')
  @Post('products/display/:id')
  updateProductDisplay(
    @Param('id') id: string,
    @Body() dto: { display: boolean },
  ) {
    this.logger.log(
      `Updating display status for product ID ${id} to ${JSON.stringify(dto)}`,
      'AdminController',
    );
    return this.productService.updateDisplayStatus(+id, dto.display);
  }

  // create product
  @ApiTags('Product')
  @Post('products')
  async createProduct(@Body() createProductDto: CreateProdDto) {
    // let tset = { ...createProductDto };
    // this.logger.log(tset);
    return await this.productService.createProduct(createProductDto);
  }

  // update product by id
  @ApiTags('Product')
  @Patch('products/:id')
  updateProduct(
    @Body() updateProductDto: UpdateProdDto,
    @Param('id') id: string,
  ) {
    return this.productService.updateProductInfo(+id, updateProductDto);
  }

  @ApiTags('Product')
  @Patch('products/price/:id')
  updateProductPrice(
    @Body() updateProductPriceDto: { price: number },
    @Param('id') id: string,
  ) {
    this.logger.log(
      `Updating price for product ID ${id} to ${updateProductPriceDto.price}`,
    );
    return this.productService.updateProductPrice(
      +id,
      updateProductPriceDto.price,
    );
  }

  // update product variant photo
  @ApiTags('Product')
  @UseInterceptors(FilesInterceptor('files'))
  @Patch('products/:prod/variant/:color')
  updateProductVariantPhoto(
    @UploadedFiles() files: Express.Multer.File[],
    @Param('prod') id: number,
    @Param('color') color: number,
  ) {
    return this.productService.updateProductVariantPhoto(id, color, files);
  }

  @ApiTags('Product')
  @Delete('products/:id')
  removeProduct(@Param('id') id: string) {
    this.logger.log(`Deleting product with ID: ${id}`);
    return;
    // return this.productService.deleteProduct(+id);
  }

  //*  Promotions
  @ApiTags('Promotion')
  @Get('promotions')
  async getAllPromotions() {
    return this.promotionService.getPromotions();
  }

  @ApiTags('Promotion')
  @Get('promotions/:id')
  async getPromotionById(@Param('id') id: string) {
    return this.promotionService.getPromotionById(+id);
  }

  @ApiTags('Promotion')
  @Post('promotions')
  async createPromotion(@Body() dto: CreatePromotionDto) {
    return this.promotionService.createPromotion(dto);
  }

  //* Voucher
  @ApiTags('Voucher')
  @Get('vouchers')
  async getAllVouchers() {
    return this.promotionService.getVouchers();
  }

  @ApiTags('Voucher')
  @Get('vouchers/:id')
  async getVoucherById(@Param('id') id: string) {
    return this.promotionService.getVoucherById(+id);
  }

  @ApiTags('Voucher')
  @UseInterceptors(FileInterceptor('file'))
  @Post('vouchers')
  async createVoucher(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateVoucherDto,
  ) {
    this.logger.log(`file: ${file?.originalname}`);
    if (!file)
      throw new BadRequestException('File upload is needed for voucher');
    const voucher = await this.promotionService.createVoucher(dto);

    const imageUrl = await this.s3ClientService.uploadFileToPublicBucket(
      `${voucher.id}`,
      file,
      'vouchers',
    );
    voucher.image = imageUrl;
    await voucher.save();

    this.logger.log(
      `Voucher created with ID: ${voucher.id} and image URL: ${imageUrl}`,
    );

    return voucher;
  }

  @ApiTags('Voucher')
  @Patch('vouchers/status/:id')
  async updateVoucher(@Param('id') id: string) {
    return this.promotionService.changeState(+id);
  }

  @ApiTags('Voucher')
  @Delete('vouchers/:id')
  async deleteVoucher(@Param('id') id: string) {
    return this.promotionService.removeVoucher(+id);
  }

  //**Order */
  @ApiTags('Order')
  @Sse('orders/stream')
  streamOrders(): Observable<MessageEvent> {
    return fromEvent(this.eventEmitter, 'order.submit').pipe(
      map((order) => {
        return { data: order } as MessageEvent;
      }),
    );
  }

  @ApiTags('Order')
  @Get('orders')
  async getAllOrders(@Query('y') y: string, @Query('m') m: string) {
    return this.orderService.getOrders(+y, +m);
  }

  @ApiTags('Order')
  @Get('orders/dashboard')
  async getOrderDashboardData(@Query('y') y: string, @Query('m') m: string) {
    return this.orderService.getOrdersByGroup(+y, +m);
  }

  @ApiTags('Order')
  @Get('orders/:id')
  async getOrderById(@Param('id') id: string) {
    const res = await this.orderService.getOrderById(+id);
    this.eventEmitter.emit('order.test', res);
    return res;
  }

  @ApiTags('Order')
  @Post('orders/delivering/:id')
  async deliverOrder(@Param('id') id: number) {
    const res = await this.orderService.confirmOrderDelivered(+id);
    this.eventEmitter.emit('order.delivered', res);
    return res;
  }

  @ApiTags('Order')
  @Post('orders/cancel/uncompleted/:id')
  async cancelOrder(@Param('id') id: number) {
    return this.orderService.cancelUncompletedOrder(+id);
  }

  @ApiTags('Order')
  @Post('orders/completed/:id')
  async completeOrder(@Param('id') id: number) {
    return this.orderService.completeOrder(+id);
  }

  @ApiTags('Order')
  @Post('orders/return/request/:id')
  async returnRequestOrder(@Param('id') id: number) {
    return this.orderService.returnOrderRequest(+id);
  }

  @ApiTags('Order')
  @Post('orders/return/process/:id')
  async processReturnOrder(@Param('id') id: number) {
    return this.orderService.returnOrderProcessing(+id);
  }

  @ApiTags('Order')
  @Post('orders/return/exchange')
  async exchangeReturnOrder(@Body() dto: ReturnOrderDto) {
    return this.orderService.exchangeOrder(dto);
  }

  @ApiTags('Order')
  @Post('orders/return/complete')
  async completeReturnOrder(@Body() dto: ReturnOrderDto) {
    return this.orderService.cancelCompletedOrder(dto);
  }

  @ApiTags('Order')
  @Post('orders/refund/:id')
  async refundOrder(@Param('id') id: number) {
    return this.orderService.refundOrder(+id);
  }

  //** Inventory */

  // @ApiTags('Inventory')
  // @Get('inventory/sync')
  // async syncInventory() {
  //   return this.adminService.syncExistingVariantsWithoutInventory();
  // }
  @ApiTags('Inventory')
  @Get('inventory/stock')
  getAllInventory() {
    return this.inventoryService.getInventoryList();
  }

  @ApiTags('Inventory')
  @Get('inventory/stock/:variantId')
  getStock(@Param('variantId') variantId: number) {
    return this.inventoryService.getStockByVariant(variantId);
  }

  @ApiTags('Inventory')
  @Get('inventory/transactions')
  getAllTransactions() {
    return this.inventoryService.getTransactionList();
  }

  @ApiTags('Inventory')
  @Get('inventory/transactions/:variantId')
  getHistory(@Param('variantId') variantId: number) {
    return this.inventoryService.getTransactionByVariant(variantId);
  }

  @ApiTags('Inventory')
  @Get('inventory/import-batch')
  getImportBatchList() {
    return this.inventoryService.getListImportBatch();
  }

  @ApiTags('Inventory')
  @Get('inventory/low-stock')
  getLowStock() {
    return this.inventoryService.getLowStockProducts();
  }

  @ApiTags('Inventory')
  @Get('inventory/import-batch/:id')
  getImportBatchDetail(@Param('id') id: number) {
    return this.inventoryService.getBatchRevenueSummary(id);
  }

  @ApiTags('Inventory')
  @UseInterceptors(FileInterceptor('file'))
  @Post('inventory/import/bulk')
  async importExcel(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: ImportBatchDto,
  ) {
    // this.logger.log(
    //   `Importing inventory from Excel file: ${file.originalname} with data: ${JSON.stringify(dto)}`,
    // );
    // return;
    const data = await this.inventoryService.extractFromExcel(file);

    return this.inventoryService.createImportBatch({
      ...dto,
      items: data,
    });
    // return this.inventoryService.extractFromExcel(
    //   file,
    //   InventoryTransactionType.IMPORT,
    //   dto.note,
    // );
  }

  @ApiTags('Inventory')
  @UseInterceptors(FileInterceptor('file'))
  @Post('inventory/adjust/bulk')
  async adjustExcel(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: { note?: string },
  ) {
    const data = await this.inventoryService.extractFromExcel(file);

    return this.inventoryService.bulkAjust({
      data: data,
      note: dto.note,
    });
    // return this.inventoryService.extractFromExcel(
    //   file,
    //   InventoryTransactionType.ADJUST,
    //   dto.note,
    // );
  }

  //** DASHBOAR */
  @ApiTags('Dashboard')
  @Get('dashboard/monthly-revenue')
  async getDashboardData(@Query('y') y: string, @Query('m') m: string) {
    // return this.adminService.getDashboardData();
    return this.orderService.getRevenueByMonthV1(+y, +m);
    // return this.inventoryService.getDailyRevenueByMonth(+y, +m);
    // return revenue;
  }

  @ApiTags('Dashboard')
  @Get('dashboard/top-selling-products')
  async getTopSellingProducts(@Query('y') y: string, @Query('m') m: string) {
    return this.orderService.getTopSellingProducts(+y, +m);
  }

  @ApiTags('Dashboard')
  @Get('dashboard/top-categories')
  async getTopCategories(@Query('y') y: string, @Query('m') m: string) {
    return this.orderService.getSalesStatisticsByCategory(+y, +m);
  }

  // ticket
  @ApiTags('Ticket')
  @Sse('tickets/stream')
  streamTickets(): Observable<MessageEvent> {
    return fromEvent(this.eventEmitter, 'ticket.created').pipe(
      map((ticket) => {
        return { data: ticket } as MessageEvent;
      }),
    );
  }

  @ApiTags('Ticket')
  @Get('tickets')
  async getAllTickets() {
    return this.ticketService.getAllTickets();
  }

  @ApiTags('Ticket')
  @Get('tickets/:id')
  async getTicketById(@Param('id') id: number) {
    return this.ticketService.getTicketById(+id);
  }

  @ApiTags('Ticket')
  @Delete('tickets/:id')
  async deleteTicket(@Param('id') id: number) {
    return this.ticketService.removeTicket(+id);
  }

  @ApiTags('Ticket')
  @Post('tickets/:id/reject')
  async tickerReject(
    @Param('id') id: number,
    @Body() dto: { adminNote?: string },
  ) {
    return this.ticketService.updateTicketStatus(
      +id,
      TicketStatus.REJECTED,
      dto.adminNote,
    );
  }

  @ApiTags('Ticket')
  @Post('tickets/:id/complete')
  async tick(@Param('id') id: number, @Body() dto: { adminNote?: string }) {
    return this.ticketService.updateTicketStatus(
      +id,
      TicketStatus.COMPLETED,
      dto.adminNote,
    );
  }
}
