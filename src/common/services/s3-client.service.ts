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
  private bucketName = 'fstore-nbphuoc';
  private s3_region = 'ap-southeast-1';
  constructor(private readonly configService: ConfigService) {
    this.client = new S3Client({
      forcePathStyle: true,
      region: this.s3_region,
      endpoint: 'https://izxsashwvdqobraupqxx.supabase.co/storage/v1/s3',
      credentials: {
        accessKeyId: this.configService.get('SUPABASE_S3_ACCESS_KEY'),
        secretAccessKey: this.configService.get('SUPABASE_S3_SECRET_KEY'),
      },
    });
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
  uploadFileToPublicBucket(code: string, file: Express.Multer.File): string {
    try {
      const bucket_name = this.bucketName;
      const key = `products/${code}`;
      this.client.send(
        new PutObjectCommand({
          Bucket: bucket_name,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: 'public-read',
          ContentLength: file.size, // calculate length of buffer
        }),
      );
      // return `https://${bucket_name}.s3.ap-southeast-1.amazonaws.com/${key}`;
      return (
        'https://izxsashwvdqobraupqxx.supabase.co/storage/v1/object/public/fstore-nbphuoc/products/' +
        code
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
