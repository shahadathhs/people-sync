import { Injectable } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import * as path from 'path';
import { v4 as uuid } from 'uuid';

export enum FileType {
  IMAGE = 'image',
  DOCUMENT = 'document',
  VIDEO = 'video',
  AUDIO = 'audio',
  ANY = 'any',
}

export interface MultipleFileOptions {
  destinationFolder: string;
  prefix: string;
  fileType?: FileType;
  fileSizeLimit?: number;
  maxFileCount?: number;
  customMimeTypes?: string[];
}

type SupportedFileType = Exclude<FileType, FileType.ANY>;

@Injectable()
export class MulterService {
  private mimeTypesMap: Record<SupportedFileType, string[]> = {
    [FileType.IMAGE]: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
    ],
    [FileType.DOCUMENT]: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv',
    ],
    [FileType.VIDEO]: [
      'video/mp4',
      'video/webm',
      'video/ogg',
      'video/avi',
      'video/quicktime',
    ],
    [FileType.AUDIO]: [
      'audio/mpeg',
      'audio/ogg',
      'audio/wav',
      'audio/mp3',
      'audio/aac',
    ],
  };

  public createMulterOptions(
    destinationFolder: string,
    prefix: string,
    fileType: FileType = FileType.IMAGE,
    fileSizeLimit = 10 * 1024 * 1024,
    customMimeTypes?: string[],
  ): MulterOptions {
    const allowedMimeTypes =
      fileType === FileType.ANY
        ? null
        : customMimeTypes || this.mimeTypesMap[fileType] || [];

    return {
      storage: diskStorage({
        destination: destinationFolder,
        filename: (req, file, cb) => {
          const ext = path.extname(file.originalname);
          cb(null, `${prefix}-${uuid()}${ext}`);
        },
      }),
      limits: {
        fileSize: fileSizeLimit,
      },
      fileFilter: (req, file, cb) => {
        if (!allowedMimeTypes || allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
        }
      },
    };
  }

  public createMultipleFileOptions(
    options: MultipleFileOptions,
  ): MulterOptions {
    const {
      destinationFolder,
      prefix,
      fileType = FileType.ANY,
      fileSizeLimit = 10 * 1024 * 1024,
      maxFileCount = 5,
      customMimeTypes,
    } = options;

    const allowedMimeTypes =
      fileType === FileType.ANY
        ? null
        : customMimeTypes || this.mimeTypesMap[fileType] || [];

    return {
      storage: diskStorage({
        destination: destinationFolder,
        filename: (req, file, cb) => {
          const ext = path.extname(file.originalname);
          cb(null, `${prefix}-${uuid()}${ext}`);
        },
      }),
      limits: {
        fileSize: fileSizeLimit,
        files: maxFileCount,
      },
      fileFilter: (req, file, cb) => {
        if (!allowedMimeTypes || allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
        }
      },
    };
  }
}
