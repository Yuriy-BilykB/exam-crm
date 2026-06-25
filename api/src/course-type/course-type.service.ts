import { Injectable } from '@nestjs/common';
import { TYPE_REF } from '../common/reference';

@Injectable()
export class CourseTypeService {
  findAll() {
    return TYPE_REF.map(({ id, name }) => ({ id, name }));
  }
}
