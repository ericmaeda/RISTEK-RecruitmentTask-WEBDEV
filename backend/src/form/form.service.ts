import { Injectable } from '@nestjs/common';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FormService {
  constructor(private prisma: PrismaService) {}

  create(data: any, userId: number) {
    return this.prisma.form.create({
      data: {
        title: data.title,
        description: data.description,
        userId: userId,
      }
    });
  }

  findAllByUser(userId: number) {
    return this.prisma.form.findMany({ where: {userId} });
  }
}
