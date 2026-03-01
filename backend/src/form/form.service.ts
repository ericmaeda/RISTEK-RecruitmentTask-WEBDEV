import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { QuestionType, Prisma } from '@prisma/client';

@Injectable()
export class FormService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateFormDto, userId: number) {
    return this.prisma.form.create({
      data: {
        title: data.title,
        description: data.description,
        userId: userId,
      },
      include: {
        questions: true,
      },
    });
  }

  async findAllByUser(userId: number) {
    return this.prisma.form.findMany({
      where: { userId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { responses: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const form = await this.prisma.form.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
        creator: {
          select: { id: true, username: true, email: true },
        },
        _count: {
          select: { responses: true },
        },
      },
    });

    if (!form) {
      throw new NotFoundException(`Form with ID ${id} not found`);
    }

    return form;
  }

  async update(id: number, data: UpdateFormDto) {
    await this.findOne(id); // Check if exists

    return this.prisma.form.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
      },
      include: {
        questions: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id); // Check if exists

    return this.prisma.form.delete({
      where: { id },
    });
  }

  // Question methods
  async createQuestion(formId: number, data: CreateQuestionDto) {
    // Verify form exists and belongs to user
    const form = await this.findOne(formId);

    // Get the highest order
    const lastQuestion = await this.prisma.question.findFirst({
      where: { formId },
      orderBy: { order: 'desc' },
    });

    const newOrder = lastQuestion ? lastQuestion.order + 1 : 1;

    return this.prisma.question.create({
      data: {
        formId,
        questionText: data.questionText,
        questionType: data.questionType as QuestionType,
        options: data.options || [],
        required: data.required ?? false,
        order: newOrder,
      },
    });
  }

  async updateQuestion(questionId: number, data: UpdateQuestionDto) {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${questionId} not found`);
    }

    return this.prisma.question.update({
      where: { id: questionId },
      data: {
        questionText: data.questionText ?? question.questionText,
        questionType: (data.questionType as QuestionType) ?? question.questionType,
        options: data.options ?? question.options,
        required: data.required ?? question.required,
        order: data.order ?? question.order,
      },
    });
  }

  async removeQuestion(questionId: number) {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${questionId} not found`);
    }

    return this.prisma.question.delete({
      where: { id: questionId },
    });
  }

  async reorderQuestions(formId: number, questionIds: number[]) {
    // Update order for each question
    const updates = questionIds.map((id, index) =>
      this.prisma.question.update({
        where: { id },
        data: { order: index + 1 },
      })
    );

    return Promise.all(updates);
  }

  // Response methods
  async submitResponse(formId: number, responses: SubmitResponseDto[]) {
    const form = await this.findOne(formId);

    return this.prisma.formResponse.create({
      data: {
        formId,
        responses: {
          create: responses.map(r => ({
            questionId: r.questionId,
            answer: JSON.stringify(r.answer),
          })),
        },
      },
      include: {
        responses: true,
      },
    });
  }

  async getResponses(formId: number) {
    await this.findOne(formId); // Verify form exists

    return this.prisma.formResponse.findMany({
      where: { formId },
      include: {
        responses: {
          include: {
            question: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

// DTO interfaces (will be in separate files)
export interface CreateQuestionDto {
  questionText: string;
  questionType: string;
  options?: string[];
  required?: boolean;
}

export interface UpdateQuestionDto {
  questionText?: string;
  questionType?: string;
  options?: string[];
  required?: boolean;
  order?: number;
}

export interface SubmitResponseDto {
  questionId: number;
  answer: string | string[];
}
