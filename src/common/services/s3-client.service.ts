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
      region: this.s3_region,
      credentials: {
        accessKeyId: this.configService.get('SUPABASE_S3_ACCESS_KEY'),
        secretAccessKey: this.configService.get('SUPABASE_S3_SECRET_KEY'),
      },
    });
  }

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

  uploadFileToPublicBucket(path: string, file: Express.Multer.File): string {
    const bucket_name = this.bucketName;
    const key = `products/${path}`;
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

    return `https://${bucket_name}.s3.ap-southeast-1.amazonaws.com/${key}`;
  }
}
