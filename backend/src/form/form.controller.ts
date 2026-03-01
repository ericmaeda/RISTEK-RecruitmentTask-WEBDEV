import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Put, Query } from '@nestjs/common';
import { FormService, FormQueryParams } from './form.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('form')
export class FormController {
  constructor(private readonly formService: FormService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createFormDto: CreateFormDto, @Request() req) {
    return this.formService.create(createFormDto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @Request() req,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('sortBy') sortBy?: 'createdAt' | 'updatedAt' | 'title',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const queryParams: FormQueryParams = {
      search,
      status: status as any,
      sortBy,
      sortOrder,
    };
    return this.formService.findAllByUser(req.user.userId, queryParams);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.formService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFormDto: UpdateFormDto) {
    return this.formService.update(+id, updateFormDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.formService.remove(+id);
  }

  // Question endpoints
  @UseGuards(JwtAuthGuard)
  @Post(':id/questions')
  createQuestion(
    @Param('id') formId: string,
    @Body() createQuestionDto: {
      questionText: string;
      questionType: string;
      options?: string[];
      required?: boolean;
    }
  ) {
    return this.formService.createQuestion(+formId, createQuestionDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('questions/:questionId')
  updateQuestion(
    @Param('questionId') questionId: string,
    @Body() updateQuestionDto: {
      questionText?: string;
      questionType?: string;
      options?: string[];
      required?: boolean;
      order?: number;
    }
  ) {
    return this.formService.updateQuestion(+questionId, updateQuestionDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('questions/:questionId')
  removeQuestion(@Param('questionId') questionId: string) {
    return this.formService.removeQuestion(+questionId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/questions/reorder')
  reorderQuestions(
    @Param('id') formId: string,
    @Body() body: { questionIds: number[] }
  ) {
    return this.formService.reorderQuestions(+formId, body.questionIds);
  }

  // Response endpoints
  @Post(':id/responses')
  submitResponse(
    @Param('id') formId: string,
    @Body() responses: { questionId: number; answer: string | string[] }[]
  ) {
    return this.formService.submitResponse(+formId, responses);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/responses')
  getResponses(@Param('id') id: string) {
    return this.formService.getResponses(+id);
  }
}
