import { PartialType } from '@nestjs/mapped-types';
import { CreateFormDto } from './create-form.dto';
import { FormService } from '../form.service';
import { Controller } from '@nestjs/common';

@Controller("form")
export class UpdateFormDto extends PartialType(CreateFormDto) {
    
}
