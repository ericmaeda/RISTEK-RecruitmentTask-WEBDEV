import { IsString, IsOptional, IsEnum } from "class-validator";

export class UpdateFormDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsEnum(['DRAFT', 'PUBLISHED', 'CLOSED'])
    @IsOptional()
    status?: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
}
