import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileType } from '@prisma/client';
import { ENVEnum } from '@project/common/enum/env.enum'; // adjust if different
import { AppError } from '@project/common/error/handle-error.app';
import { HandleError } from '@project/common/error/handle-error.decorator';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import * as fs from 'fs';
import mime from 'mime-types';
import path from 'path';
import { Readable } from 'stream';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFileDto } from './dto/create-file.dto';

@Injectable()
export class FileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    cloudinary.config({
      cloud_name: this.configService.getOrThrow<string>(
        ENVEnum.CLOUDINARY_CLOUD_NAME,
      ),
      api_key: this.configService.getOrThrow<string>(
        ENVEnum.CLOUDINARY_API_KEY,
      ),
      api_secret: this.configService.getOrThrow<string>(
        ENVEnum.CLOUDINARY_API_SECRET,
      ),
    });
  }

  /* -------------------------
   | CRUD & Helpers
   * ------------------------*/

  @HandleError('Error creating file', 'file')
  async create(createFileDto: CreateFileDto) {
    const file = await this.prisma.fileInstance.create({
      data: createFileDto,
    });

    if (!file) {
      throw new AppError(400, 'Error creating file');
    }

    return file;
  }

  @HandleError('Error finding file', 'file')
  async findOne(id: string) {
    const file = await this.prisma.fileInstance.findUnique({
      where: { id },
    });

    if (!file) {
      throw new AppError(404, 'File not found');
    }

    return file;
  }

  @HandleError('Error finding file by filename', 'file')
  async findByFilename(filename: string) {
    const file = await this.prisma.fileInstance.findFirst({
      where: { filename },
    });

    if (!file) {
      throw new AppError(404, 'File not found');
    }

    return file;
  }

  @HandleError('Error listing files', 'file')
  async findMany(opts?: {
    skip?: number;
    take?: number;
    fileType?: FileType;
    search?: string;
  }) {
    const { skip = 0, take = 20, fileType, search } = opts || {};

    const where: any = {};
    if (fileType) where.fileType = fileType;
    if (search) {
      where.OR = [
        { filename: { contains: search } },
        { originalFilename: { contains: search } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.fileInstance.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.fileInstance.count({ where }),
    ]);

    return { items, total, skip, take };
  }

  @HandleError('Error updating file', 'file')
  async update(id: string, data: Partial<CreateFileDto>) {
    const updated = await this.prisma.fileInstance.update({
      where: { id },
      data,
    });

    if (!updated) throw new AppError(400, 'Error updating file');

    return updated;
  }

  @HandleError('Error bulk updating files', 'file')
  async bulkUpdate(items: Array<{ id: string; data: Partial<CreateFileDto> }>) {
    // Use transaction to ensure atomic-ish behaviour
    const ops = items.map((it) =>
      this.prisma.fileInstance.update({
        where: { id: it.id },
        data: it.data,
      }),
    );

    return this.prisma.$transaction(ops);
  }

  @HandleError('Error deleting file', 'file')
  async remove(id: string): Promise<void> {
    const file = await this.findOne(id);

    // delete from Cloudinary if publicId exists
    if (file.publicId) {
      try {
        await cloudinary.uploader.destroy(file.publicId, {
          resource_type: 'auto',
        });
      } catch (err) {
        // warn but continue to attempt db delete; you may choose to fail instead
        console.warn('Cloudinary delete failed for', file.publicId, err);
        throw new AppError(400, 'Error deleting file from Cloudinary');
      }
    }

    await this.prisma.fileInstance.delete({ where: { id } });
  }

  @HandleError('Error bulk deleting files', 'file')
  async bulkDelete(ids: string[]) {
    const files = await this.prisma.fileInstance.findMany({
      where: { id: { in: ids } },
    });

    // delete from cloudinary in parallel
    const cloudDeletes = files.map((f) =>
      f.publicId
        ? cloudinary.uploader.destroy(f.publicId, { resource_type: 'auto' })
        : Promise.resolve(null),
    );
    await Promise.allSettled(cloudDeletes);

    // delete db records
    await this.prisma.fileInstance.deleteMany({ where: { id: { in: ids } } });

    return { deleted: ids.length };
  }

  /* -------------------------
   | Upload helpers (Cloudinary)
   * ------------------------*/

  /**
   * Upload a buffer (e.g., file.buffer from multer) to Cloudinary.
   * Returns UploadApiResponse
   */
  @HandleError('Error uploading buffer to Cloudinary', 'file')
  async uploadBufferToCloudinary(
    buffer: Buffer,
    filename: string,
    folder = 'uploads',
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const originalNameWithoutExt = path.parse(filename).name;

      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: originalNameWithoutExt + '-' + Date.now(),
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result as UploadApiResponse);
        },
      );

      Readable.from(buffer).pipe(stream);
    });
  }

  /**
   * Upload a local file path to Cloudinary (useful if multer stored a temp file)
   */
  @HandleError('Error uploading file from path to Cloudinary', 'file')
  async uploadPathToCloudinary(
    filePath: string,
    filename?: string,
    folder = 'uploads',
  ): Promise<UploadApiResponse> {
    return cloudinary.uploader.upload(filePath, {
      folder,
      public_id: filename
        ? path.parse(filename).name + '-' + Date.now()
        : undefined,
      resource_type: 'auto',
    });
  }

  /**
   * Process an uploaded file from multer (supports file.buffer or file.path).
   * - uploads to Cloudinary
   * - creates Prisma record (stores url and publicId)
   */
  @HandleError('Error processing uploaded file', 'file')
  async processUploadedFile(file: Express.Multer.File, folder = 'uploads') {
    const originalName = file.originalname;
    const mimeType =
      file.mimetype || mime.lookup(originalName) || 'application/octet-stream';
    const fileType = this.mapMimeToPrismaFileType(mimeType);

    let uploadResult: UploadApiResponse;

    if ((file as any).buffer) {
      uploadResult = await this.uploadBufferToCloudinary(
        (file as any).buffer,
        originalName,
        folder,
      );
    } else if (file.path && fs.existsSync(file.path)) {
      uploadResult = await this.uploadPathToCloudinary(
        file.path,
        originalName,
        folder,
      );
      // remove local tmp file if present
      try {
        fs.unlinkSync(file.path);
      } catch (e) {
        console.warn('Failed to remove local temp file', file.path, e);
      }
    } else {
      throw new AppError(400, 'No file buffer or path available for upload');
    }

    const createDto: CreateFileDto = {
      filename:
        uploadResult.public_id.split('/').slice(-1)[0] +
        path.extname(originalName),
      originalFilename: originalName,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      fileType,
      mimeType,
      size: file.size ?? Number(uploadResult.bytes ?? 0),
    };

    return this.create(createDto);
  }

  /**
   * If you already have a buffer and metadata and want to both upload and persist
   */
  @HandleError('Error uploading buffer & creating file record', 'file')
  async uploadBufferAndCreate(params: {
    buffer: Buffer;
    originalName: string;
    folder?: string;
  }) {
    const { buffer, originalName, folder = 'uploads' } = params;
    const mimeType = mime.lookup(originalName) || 'application/octet-stream';
    const fileType = this.mapMimeToPrismaFileType(String(mimeType));

    const uploadResult = await this.uploadBufferToCloudinary(
      buffer,
      originalName,
      folder,
    );

    const createDto: CreateFileDto = {
      filename:
        uploadResult.public_id.split('/').slice(-1)[0] +
        path.extname(originalName),
      originalFilename: originalName,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      fileType,
      mimeType: String(mimeType),
      size: Buffer.byteLength(buffer),
    };

    return this.create(createDto);
  }

  /* -------------------------
   | Utility
   * ------------------------*/

  private mapMimeToPrismaFileType(mimeType?: string | null): FileType {
    const top = (mimeType || '').split('/')[0].toLowerCase();

    switch (top) {
      case 'image':
        return FileType.IMAGE;
      case 'video':
        return FileType.VIDEO;
      case 'audio':
        return FileType.AUDIO;
      case 'text':
        return FileType.DOCUMENT;
      case 'application':
        // treat most application/* as documents (pdf, msword, json, etc.)
        return FileType.DOCUMENT;
      default:
        return FileType.ANY;
    }
  }
}
