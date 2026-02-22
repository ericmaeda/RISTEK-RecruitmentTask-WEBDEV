import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(data: any) {
    const {email, password, username} = data;

    const existingUser = await this.prisma.user.findUnique({ where: {email} })
    if (existingUser) {
      throw new BadRequestException("Email telah terdaftar! Gunakan email lainnya atau lakukan Login!");
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await this.prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
      },
    })

    return {message: 'Pendaftaran berhasil! Silakan lakukan Login!', userId: user.id}
  }

  async logic(data: any) {
    const {email, password} = data;

    const user = this.prisma.user.findUnique({ where:{email} });
    const passwordValid = await bcrypt.compare(password, user.password);

    // cek apakah user exist 
    if (!user || !passwordValid) {
      throw new UnauthorizedException("Cek kembali username dan password Anda!")
    }

    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    return {
      message: "Login berhasil!",
      access_token: token,
    };
  }
  
}
