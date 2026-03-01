import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { QuestionType, Prisma, FormStatus } from '@prisma/client';

export interface FormQueryParams {
  search?: string;
  status?: FormStatus;
  sortBy?: 'createdAt' | 'updatedAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}

@Injectable()
export class FormService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateFormDto, userId: number) {
    return this.prisma.form.create({
      data: {
        title: data.title,
        description: data.description,
        userId: userId,
        status: FormStatus.DRAFT,
      },
      include: {
        questions: true,
      },
    });
  }

  async findAllByUser(userId: number, query: FormQueryParams = {}) {
    const { search, status, sortBy = 'createdAt', sortOrder = 'desc' } = query;

    const where: Prisma.FormWhereInput = {
      userId,
    };

    // Search by title
    if (search) {
      where.title = {
        contains: search,
        mode: 'insensitive',
      };
    }

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Sorting
    const orderBy: Prisma.FormOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    return this.prisma.form.findMany({
      where,
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { responses: true },
        },
      },
      orderBy,
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
        status: data.status,
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

  /**
   * Check if form has any submissions
   */
  private async hasFormResponses(formId: number): Promise<boolean> {
    const count = await this.prisma.formResponse.count({
      where: { formId },
    });
    return count > 0;
  }

  /**
   * CONSTRAINT: If form has submissions, cannot delete or modify questions
   */
  async createQuestion(formId: number, data: CreateQuestionDto) {
    // Verify form exists
    const form = await this.findOne(formId);

    // Check constraint: if form has responses, cannot add questions
    if (await this.hasFormResponses(formId)) {
      throw new ForbiddenException(
        'Cannot add questions to a form that already has submissions. Please create a new form instead.'
      );
    }

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
      include: {
        form: true,
      },
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${questionId} not found`);
    }

    // CONSTRAINT: If form has responses, cannot change question type
    if (data.questionType && data.questionType !== question.questionType) {
      if (await this.hasFormResponses(question.formId)) {
        throw new ForbiddenException(
          'Cannot change question type for a form that already has submissions. This would invalidate existing responses.'
        );
      }
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

    // CONSTRAINT: If form has responses, cannot delete questions
    if (await this.hasFormResponses(question.formId)) {
      throw new ForbiddenException(
        'Cannot delete questions from a form that already has submissions. This would invalidate existing responses.'
      );
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

    // Only allow response submission for published forms
    if (form.status !== FormStatus.PUBLISHED) {
      throw new BadRequestException(
        'Cannot submit response to a form that is not published.'
      );
    }

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

// DTO interfaces
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
