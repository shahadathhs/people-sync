import { CreateFileDto } from '@/common/dto/create-file.dto';
import { ENVEnum } from '@/common/enum/env.enum';
import { AppError } from '@/common/error/handle-error.app';
import { HandleError } from '@/common/error/handle-error.decorator';
import { Global, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Bucket, FileType } from '@prisma/client';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import mime from 'mime-types';
import { PrismaService } from '../prisma/prisma.service';

@Global()
@Injectable()
export class FileService {
  private supabase: SupabaseClient;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    // MUST use service_role key for server-side operations
    this.supabase = createClient(
      this.configService.getOrThrow<string>(ENVEnum.SUPABASE_URL),
      this.configService.getOrThrow<string>(ENVEnum.SUPABASE_SERVICE_ROLE_KEY),
    );
  }

  /* ================== CRUD ================== */
  @HandleError('Error creating file', 'file')
  async create(createFileDto: CreateFileDto & { bucket: Bucket }) {
    // generate public URL if bucket is public
    const { data: publicData } = this.supabase.storage
      .from(createFileDto.bucket)
      .getPublicUrl(createFileDto.path);

    return this.prisma.fileInstance.create({
      data: { ...createFileDto, publicUrl: publicData.publicUrl },
    });
  }

  @HandleError('Error finding file', 'file')
  async findOne(id: string) {
    const file = await this.prisma.fileInstance.findUnique({ where: { id } });
    if (!file) throw new AppError(404, 'File not found');
    return file;
  }

  @HandleError('Error finding files', 'file')
  async findMany(skip = 0, take = 20) {
    return this.prisma.fileInstance.findMany({ skip, take });
  }

  @HandleError('Error updating file', 'file')
  async update(id: string, data: Partial<CreateFileDto>) {
    return this.prisma.fileInstance.update({ where: { id }, data });
  }

  @HandleError('Error deleting file', 'file')
  async remove(id: string) {
    const file = await this.findOne(id);
    await this.deleteFromSupabase(file.bucket, file.path);
    return this.prisma.fileInstance.delete({ where: { id } });
  }

  /* ================== UPLOAD ================== */
  @HandleError('Error processing uploaded file', 'file')
  async processUploadedFile(file: Express.Multer.File, bucket: Bucket) {
    if (!file || !file.buffer)
      throw new AppError(400, 'Invalid file upload input');

    const ext = mime.extension(file.mimetype || '') || '';
    const name = file.originalname.split('.')[0];
    const filename = `${randomUUID()}-${name}.${ext}`;
    const pathInBucket = filename;

    const { error } = await this.supabase.storage
      .from(bucket)
      .upload(pathInBucket, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error)
      throw new AppError(500, `Supabase upload failed: ${error.message}`);

    const fileType = this.mapMimeToPrismaFileType(file.mimetype);
    const createFileDto: CreateFileDto & { bucket: Bucket } = {
      filename,
      bucket,
      path: pathInBucket,
      mimeType: file.mimetype,
      size: file.size,
      fileType,
    };

    return this.create(createFileDto);
  }

  async bulkUpload(
    files: Express.Multer.File[],
    bucket: Bucket = Bucket.product,
  ) {
    return Promise.all(files.map((f) => this.processUploadedFile(f, bucket)));
  }

  /* ================== HELPERS ================== */
  private async deleteFromSupabase(bucket: string, path: string) {
    const { error } = await this.supabase.storage.from(bucket).remove([path]);
    if (error)
      throw new AppError(500, `Supabase delete failed: ${error.message}`);
  }

  private mapMimeToPrismaFileType(
    mimeType: string | null | undefined,
  ): FileType {
    const top = (mimeType || '').split('/')[0].toLowerCase();

    switch (top) {
      case 'image':
        return FileType.IMAGE;
      case 'video':
        return FileType.VIDEO;
      case 'audio':
        return FileType.AUDIO;
      case 'text':
      case 'application':
        return FileType.DOCUMENT;
      default:
        return FileType.ANY;
    }
  }
}
