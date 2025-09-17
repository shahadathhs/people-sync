import { ApiProperty } from '@nestjs/swagger';
import { FileType } from '@prisma/client';
import { IsEnum, IsNumber, IsString } from 'class-validator';

export class CreateFileDto {
  @ApiProperty({
    example: 'file_12345.png',
    description: 'Generated filename stored in DB',
  })
  @IsString()
  filename: string;

  @ApiProperty({
    example: 'my_photo.png',
    description: 'Original filename uploaded by user',
  })
  @IsString()
  originalFilename: string;

  @ApiProperty({
    example:
      'https://res.cloudinary.com/demo/image/upload/v1691234567/file_12345.png',
    description: 'Public Cloudinary URL',
  })
  @IsString()
  url: string;

  @ApiProperty({
    example: 'file_12345',
    description: 'Cloudinary public_id for delete operations',
  })
  @IsString()
  publicId: string;

  @ApiProperty({
    enum: FileType,
    example: FileType.IMAGE,
    description: 'General file type category',
  })
  @IsEnum(FileType)
  fileType: FileType;

  @ApiProperty({
    example: 'image/png',
    description: 'Exact MIME type of the uploaded file',
  })
  @IsString()
  mimeType: string;

  @ApiProperty({ example: 204800, description: 'File size in bytes' })
  @IsNumber()
  size: number;
}
