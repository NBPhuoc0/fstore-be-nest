import { PartialType } from '@nestjs/swagger';
import { createCateDto } from './create-cate.dto';

export class UpdateCateDto extends PartialType(createCateDto) {}
