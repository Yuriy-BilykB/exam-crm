import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { UpdateOrderDto } from './dto/order.dto';
import { OrderListQueryDto } from './dto/order.dto';
import * as ExcelJS from 'exceljs';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async findAll(
    query: OrderListQueryDto,
    currentUserId: number,
  ): Promise<{ data: Order[]; total: number }> {
    const {
      page = 1,
      limit = 25,
      sortBy = 'created_at',
      sortOrder = 'DESC',
      my_orders = false,
      name,
      surname,
      email,
      phone,
      status_id,
      course_id,
      format_id,
      type_id,
      manager_id,
      group_id,
    } = query;

    const qb = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.course', 'course')
      .leftJoinAndSelect('order.format', 'format')
      .leftJoinAndSelect('order.type', 'type')
      .leftJoinAndSelect('order.status', 'status')
      .leftJoinAndSelect('order.manager', 'manager')
      .leftJoinAndSelect('order.group', 'group');

    if (my_orders) {
      qb.andWhere('order.manager_id = :managerId', { managerId: currentUserId });
    }
    if (name) qb.andWhere('order.name LIKE :name', { name: `%${name}%` });
    if (surname) qb.andWhere('order.surname LIKE :surname', { surname: `%${surname}%` });
    if (email) qb.andWhere('order.email LIKE :email', { email: `%${email}%` });
    if (phone) qb.andWhere('order.phone LIKE :phone', { phone: `%${phone}%` });
    if (status_id) qb.andWhere('order.status_id = :statusId', { statusId: status_id });
    if (course_id) qb.andWhere('order.course_id = :courseId', { courseId: course_id });
    if (format_id) qb.andWhere('order.format_id = :formatId', { formatId: format_id });
    if (type_id) qb.andWhere('order.type_id = :typeId', { typeId: type_id });
    if (manager_id) qb.andWhere('order.manager_id = :managerId', { managerId: manager_id });
    if (group_id) qb.andWhere('order.group_id = :groupId', { groupId: group_id });

    const sortColumn = this.mapSortColumn(sortBy);
    qb.orderBy(sortColumn, sortOrder);

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  private mapSortColumn(sortBy: string): string {
    const map: Record<string, string> = {
      id: 'order.id',
      name: 'order.name',
      surname: 'order.surname',
      email: 'order.email',
      phone: 'order.phone',
      age: 'order.age',
      course: 'course.code',
      course_format: 'format.name',
      course_type: 'type.name',
      status: 'status.name',
      manager: 'manager.name',
      group: 'group.name',
      sum: 'order.sum',
      already_paid: 'order.alreadyPaid',
      created_at: 'order.created_at',
    };
    return map[sortBy] || 'order.created_at';
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['course', 'format', 'type', 'status', 'manager', 'group', 'comments', 'comments.user'],
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async update(id: number, dto: UpdateOrderDto, currentUserId: number): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id }, relations: ['manager'] });
    if (!order) throw new NotFoundException('Order not found');
    if (order.managerId != null && order.managerId !== currentUserId) {
      throw new ForbiddenException('You can only edit orders without manager or assigned to you');
    }
    const updatePayload: Partial<Order> = {};
    if (dto.name !== undefined) updatePayload.name = dto.name;
    if (dto.surname !== undefined) updatePayload.surname = dto.surname;
    if (dto.email !== undefined) updatePayload.email = dto.email;
    if (dto.phone !== undefined) updatePayload.phone = dto.phone;
    if (dto.age !== undefined) updatePayload.age = dto.age;
    if (dto.course_id !== undefined) updatePayload.courseId = dto.course_id;
    if (dto.format_id !== undefined) updatePayload.formatId = dto.format_id;
    if (dto.type_id !== undefined) updatePayload.typeId = dto.type_id;
    if (dto.status_id !== undefined) updatePayload.statusId = dto.status_id;
    if (dto.manager_id !== undefined) updatePayload.managerId = dto.manager_id;
    if (dto.group_id !== undefined) updatePayload.groupId = dto.group_id;
    if (dto.sum !== undefined) updatePayload.sum = dto.sum;
    if (dto.already_paid !== undefined) updatePayload.alreadyPaid = dto.already_paid;
    if (dto.utm !== undefined) updatePayload.utm = dto.utm;
    if (dto.message !== undefined) updatePayload.message = dto.message;
    await this.orderRepository.update(id, updatePayload);
    return this.findOne(id);
  }

  async exportExcel(query: OrderListQueryDto, currentUserId: number): Promise<Buffer> {
    const { data } = await this.findAll({ ...query, limit: 10000 }, currentUserId);
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Orders');
    sheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Name', key: 'name', width: 15 },
      { header: 'Surname', key: 'surname', width: 15 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Age', key: 'age', width: 6 },
      { header: 'Course', key: 'course', width: 10 },
      { header: 'Format', key: 'format', width: 10 },
      { header: 'Type', key: 'type', width: 12 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Manager', key: 'manager', width: 15 },
      { header: 'Group', key: 'group', width: 15 },
      { header: 'Sum', key: 'sum', width: 10 },
      { header: 'Already Paid', key: 'alreadyPaid', width: 12 },
      { header: 'Created At', key: 'created_at', width: 20 },
    ];
    for (const o of data) {
      sheet.addRow({
        id: o.id,
        name: o.name,
        surname: o.surname,
        email: o.email,
        phone: o.phone,
        age: o.age,
        course: o.course?.code ?? '',
        format: o.format?.name ?? '',
        type: o.type?.name ?? '',
        status: o.status?.name ?? '',
        manager: o.manager?.name ?? '',
        group: o.group?.name ?? '',
        sum: o.sum,
        alreadyPaid: o.alreadyPaid,
        created_at: o.created_at,
      });
    }
    return Buffer.from(await workbook.xlsx.writeBuffer());
  }
}
