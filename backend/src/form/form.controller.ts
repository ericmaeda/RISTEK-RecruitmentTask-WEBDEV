import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { FormService } from './form.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('form')
export class FormController {
  constructor(private readonly formService: FormService) {}

  @UseGuards(AuthGuard("jwt"))
  @Post()
  create(@Body() createFormDto: any, @Request() req) {
    return this.formService.create(createFormDto, req.user.userId);
  }

  @UseGuards(AuthGuard("jwt"))
  @Get()
  findAll(@Request() req) {
    return this.formService.findAllByUser(req.user.userId);
  }
}
