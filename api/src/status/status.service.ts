import { Injectable } from '@nestjs/common';
import { STATUS_REF } from '../common/reference';

@Injectable()
export class StatusService {
  findAll() {
    return STATUS_REF.map(({ id, name }) => ({ id, name }));
  }
}
