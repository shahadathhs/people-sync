import { ApiProperty } from '@nestjs/swagger';
import { FileType } from '@prisma/client';
import { IsEnum, IsNumber, IsString } from 'class-validator';

export class CreateFileDto {
  @ApiProperty({
    example: 'file_12345.png',
    description: 'Filename stored in Supabase',
  })
  @IsString()
  filename: string;

  @ApiProperty({
    example: 'user123/file_12345.png',
    description: 'Path inside the bucket',
  })
  @IsString()
  path: string;

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
