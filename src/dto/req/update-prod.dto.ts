import { PartialType } from "@nestjs/swagger";
import { CreateProdDto } from "./create-prod.dto";

export class UpdateProdDto extends PartialType(CreateProdDto){}