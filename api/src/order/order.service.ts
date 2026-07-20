import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { PrismaService } from '../database/prisma.service';
import { UpdateOrderDto, OrderListQueryDto } from './dto/order.dto';
import type { Prisma } from '../generated/prisma/client';

const ORDER_SELECT = {
  id: true,
  name: true,
  surname: true,
  email: true,
  phone: true,
  age: true,
  course: true,
  courseFormat: true,
  courseType: true,
  status: true,
  sum: true,
  alreadyPaid: true,
  utm: true,
  message: true,
  createdAt: true,
  manager: { select: { id: true, name: true } },
  group: { select: { id: true, name: true } },
} satisfies Prisma.OrderSelect;

const COMMENT_SELECT = {
  id: true,
  orderId: true,
  userId: true,
  text: true,
  createdAt: true,
  user: { select: { id: true, name: true, email: true } },
} satisfies Prisma.CommentSelect;

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhere(
    query: OrderListQueryDto,
    currentUserId: string,
  ): Prisma.OrderWhereInput {
    const where: Prisma.OrderWhereInput = {};

    if (query.my_orders) where.managerId = currentUserId;
    if (query.name) where.name = { contains: query.name };
    if (query.surname) where.surname = { contains: query.surname };
    if (query.email) where.email = { contains: query.email };
    if (query.phone) where.phone = { contains: query.phone };
    if (query.status) where.status = query.status;
    if (query.course) where.course = query.course;
    if (query.format) where.courseFormat = query.format;
    if (query.type) where.courseType = query.type;
    if (query.age !== undefined) where.age = query.age;
    if (query.manager_id) where.managerId = query.manager_id;
    if (query.group_id) where.groupId = query.group_id;

    if (query.startDate || query.endDate) {
      const createdAt: Prisma.DateTimeNullableFilter = {};
      if (query.startDate) {
        createdAt.gte = new Date(`${query.startDate}T00:00:00`);
      }
      if (query.endDate) {
        createdAt.lte = new Date(`${query.endDate}T23:59:59.999`);
      }
      where.createdAt = createdAt;
    }

    return where;
  }

  private buildOrderBy(
    sortBy: string,
    sortOrder: 'asc' | 'desc',
  ): Prisma.OrderOrderByWithRelationInput {
    switch (sortBy) {
      case 'id':
        return { id: sortOrder };
      case 'name':
        return { name: sortOrder };
      case 'surname':
        return { surname: sortOrder };
      case 'email':
        return { email: sortOrder };
      case 'phone':
        return { phone: sortOrder };
      case 'age':
        return { age: sortOrder };
      case 'course':
        return { course: sortOrder };
      case 'courseFormat':
        return { courseFormat: sortOrder };
      case 'courseType':
        return { courseType: sortOrder };
      case 'status':
        return { status: sortOrder };
      case 'manager':
        return { manager: { name: sortOrder } };
      case 'group':
        return { group: { name: sortOrder } };
      case 'sum':
        return { sum: sortOrder };
      case 'alreadyPaid':
        return { alreadyPaid: sortOrder };
      default:
        return { createdAt: sortOrder };
    }
  }

  async getOrders(query: OrderListQueryDto, currentUserId: string) {
    const { page, limit } = query;
    const sortOrder = query.sortOrder === 'ASC' ? 'asc' : 'desc';
    const where = this.buildWhere(query, currentUserId);
    const orderBy = this.buildOrderBy(query.sortBy, sortOrder);

    const [data, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        select: ORDER_SELECT,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return { data, total };
  }

  async getOrder(id: number) {
    return await this.prisma.order.findUniqueOrThrow({
      where: { id },
      select: {
        ...ORDER_SELECT,
        comments: { select: COMMENT_SELECT, orderBy: { createdAt: 'asc' } },
      },
    });
  }

  async update(id: number, dto: UpdateOrderDto, currentUserId: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.managerId != null && order.managerId !== currentUserId) {
      throw new ForbiddenException(
        'You can only edit orders without a manager or assigned to you',
      );
    }
    await this.prisma.order.update({ where: { id }, data: dto });

    return this.getOrder(id);
  }

  async exportExcel(
    query: OrderListQueryDto,
    currentUserId: string,
  ): Promise<Buffer> {
    const where = this.buildWhere(query, currentUserId);
    const orderBy = this.buildOrderBy(
      query.sortBy,
      query.sortOrder === 'ASC' ? 'asc' : 'desc',
    );
    const data = await this.prisma.order.findMany({
      where,
      select: ORDER_SELECT,
      orderBy,
    });

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
      { header: 'Format', key: 'courseFormat', width: 10 },
      { header: 'Type', key: 'courseType', width: 12 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Manager', key: 'manager', width: 15 },
      { header: 'Group', key: 'group', width: 15 },
      { header: 'Sum', key: 'sum', width: 10 },
      { header: 'Already Paid', key: 'alreadyPaid', width: 12 },
      { header: 'Created At', key: 'createdAt', width: 20 },
    ];
    for (const order of data) {
      sheet.addRow({
        ...order,
        course: order.course ?? '',
        courseFormat: order.courseFormat ?? '',
        courseType: order.courseType ?? '',
        status: order.status ?? '',
        manager: order.manager?.name ?? '',
        group: order.group?.name ?? '',
      });
    }
    return Buffer.from(await workbook.xlsx.writeBuffer());
  }
}
