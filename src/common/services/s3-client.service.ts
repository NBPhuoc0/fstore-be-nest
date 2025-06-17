import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3ClientService {
  private logger = new Logger('S3ClientService');
  private client: S3Client;
  private bucketName: string;
  private s3_region: string;
  private s3_endpoint: string;
  private accessKeyId: string;
  private secretAccessKey: string;
  constructor(private readonly configService: ConfigService) {
    this.logger.log('S3ClientService initialized');

    if (this.configService.get<boolean>('AWS_S3')) {
      this.logger.log('Using AWS S3');
      this.bucketName = this.configService.getOrThrow('AWS_S3_BUCKET');
      this.s3_region = this.configService.getOrThrow('AWS_S3_REGION');
      this.s3_endpoint = this.configService.getOrThrow('AWS_S3_ENDPOINT');
      this.client = new S3Client({
        region: this.s3_region,
        credentials: {
          accessKeyId: this.configService.getOrThrow('AWS_S3_ACCESS_KEY'),
          secretAccessKey: this.configService.getOrThrow('AWS_S3_SECRET_KEY'),
        },
      });
    } else {
      this.logger.log('Using Supabase S3');
      this.s3_region = this.configService.getOrThrow('SUPABASE_S3_REGION');
      this.s3_endpoint = this.configService.getOrThrow('SUPABASE_S3_ENDPOINT');
      this.client = new S3Client({
        forcePathStyle: true,
        region: this.s3_region,
        endpoint: this.s3_endpoint,
        credentials: {
          accessKeyId: this.configService.getOrThrow('SUPABASE_S3_ACCESS_KEY'),
          secretAccessKey: this.configService.getOrThrow(
            'SUPABASE_S3_SECRET_KEY',
          ),
        },
      });
    }
  }

  // get presigned url for uploading file from client
  async getPresignedSignedUrl(key: string) {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: `products/${key}`,
        ACL: 'public-read',
      });

      const url = await getSignedUrl(this.client, command, {
        expiresIn: 60 * 60, // 1 hours
      });

      return { url };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  // upload file form server
  uploadFileToPublicBucket(
    code: string,
    file: Express.Multer.File,
    type: string = 'products',
  ): string {
    try {
      this.client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: `${type}/${code}`,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: 'public-read',
          ContentLength: file.size, // calculate length of buffer
        }),
      );
      return `${this.s3_endpoint}/${type}/` + code;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
