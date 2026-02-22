import { IsEmail, IsString, MinLength } from "class-validator";

export class AuthDto {
    @IsEmail()
    email: string;

    @IsString()
    username: string;

    @MinLength(8)
    password: string;
}
