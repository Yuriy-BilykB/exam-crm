import { Injectable } from '@nestjs/common';
import { FORMAT_REF } from '../common/reference';

@Injectable()
export class CourseFormatService {
  findAll() {
    return FORMAT_REF.map(({ id, name }) => ({ id, name }));
  }
}
