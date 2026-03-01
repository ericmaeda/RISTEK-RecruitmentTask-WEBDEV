import { IsEmail, IsString, IsOptional, MinLength } from "class-validator";

export class AuthDto {
    @IsEmail()
    email: string;

    @IsString()
    @IsOptional()
    username?: string;

    @MinLength(8)
    password: string;
}
