import { Global, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileType } from '@prisma/client';
import { ENVEnum } from '@project/common/enum/env.enum';
import { AppError } from '@project/common/error/handle-error.app';
import { HandleError } from '@project/common/error/handle-error.decorator';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import * as fs from 'fs';
import mime from 'mime-types';
import * as path from 'path';
import { Readable } from 'stream';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFileDto } from './dto/create-file.dto';

@Global()
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

  /* ================== CRUD ================== */
  @HandleError('Error creating file', 'file')
  async create(createFileDto: CreateFileDto) {
    return this.prisma.fileInstance.create({ data: createFileDto });
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

  @HandleError('Error bulk updating files', 'file')
  async bulkUpdate(ids: string[], data: Partial<CreateFileDto>) {
    return this.prisma.fileInstance.updateMany({
      where: { id: { in: ids } },
      data,
    });
  }

  @HandleError('Error deleting file', 'file')
  async remove(id: string) {
    const file = await this.findOne(id);
    await this.deleteFromCloudinary(file.filename); // filename = Cloudinary public_id
    return this.prisma.fileInstance.delete({ where: { id } });
  }

  @HandleError('Error bulk deleting files', 'file')
  async bulkDelete(ids: string[]) {
    const files = await this.prisma.fileInstance.findMany({
      where: { id: { in: ids } },
    });
    await Promise.all(files.map((f) => this.deleteFromCloudinary(f.filename)));
    return this.prisma.fileInstance.deleteMany({ where: { id: { in: ids } } });
  }

  /* ================== UPLOAD ================== */
  @HandleError('Error processing uploaded file', 'file')
  async processUploadedFile(file: Express.Multer.File, folder = 'uploads') {
    let uploadResult: UploadApiResponse;

    if (file.buffer) {
      uploadResult = await this.uploadBufferToCloudinary(
        file.buffer,
        file.originalname,
        folder,
      );
    } else if (file.path) {
      uploadResult = await this.uploadPathToCloudinary(
        file.path,
        file.originalname,
        folder,
      );
      fs.unlinkSync(file.path); // remove temp file (if diskStorage was used)
    } else {
      throw new AppError(400, 'Invalid file upload input');
    }

    const mimeType =
      file.mimetype ||
      mime.lookup(file.originalname) ||
      'application/octet-stream';
    const fileType = this.mapMimeToPrismaFileType(mimeType);

    const createFileDto: CreateFileDto = {
      filename: uploadResult.public_id, // Cloudinary public_id
      originalFilename: file.originalname,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      fileType,
      mimeType,
      size: file.size ?? Number(uploadResult.bytes ?? 0),
    };

    return this.create(createFileDto);
  }

  async bulkUpload(files: Express.Multer.File[], folder = 'uploads') {
    return Promise.all(files.map((f) => this.processUploadedFile(f, folder)));
  }

  async uploadBufferAndCreate(
    buffer: Buffer,
    originalName: string,
    folder = 'uploads',
  ) {
    const uploadResult = await this.uploadBufferToCloudinary(
      buffer,
      originalName,
      folder,
    );

    const mimeType = mime.lookup(originalName) || 'application/octet-stream';
    const fileType = this.mapMimeToPrismaFileType(mimeType);

    const createFileDto: CreateFileDto = {
      filename: uploadResult.public_id,
      originalFilename: originalName,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      fileType,
      mimeType,
      size: Number(uploadResult.bytes ?? 0),
    };

    return this.create(createFileDto);
  }

  /* ================== HELPERS ================== */
  private uploadBufferToCloudinary(
    buffer: Buffer,
    filename: string,
    folder: string,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const originalNameWithoutExt = path.parse(filename).name;
      const stream = cloudinary.uploader.upload_stream(
        { folder, public_id: originalNameWithoutExt, resource_type: 'auto' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result as UploadApiResponse);
        },
      );
      Readable.from(buffer).pipe(stream);
    });
  }

  private uploadPathToCloudinary(
    filePath: string,
    filename: string,
    folder: string,
  ): Promise<UploadApiResponse> {
    const originalNameWithoutExt = path.parse(filename).name;
    return cloudinary.uploader.upload(filePath, {
      folder,
      public_id: originalNameWithoutExt,
      resource_type: 'auto',
    });
  }

  private async deleteFromCloudinary(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
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
        return FileType.DOCUMENT;
      case 'application':
        return FileType.DOCUMENT;
      default:
        return FileType.ANY;
    }
  }
}
