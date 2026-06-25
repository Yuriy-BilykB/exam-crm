import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { PrismaService } from '../database/prisma.service';
import { UpdateOrderDto, OrderListQueryDto } from './dto/order.dto';
import {
  statusRef,
  statusValueById,
  formatRef,
  formatValueById,
  typeRef,
  typeValueById,
} from '../common/reference';
import type { Prisma } from '../generated/prisma/client';

const LIST_INCLUDE = {
  client: true,
  course: true,
  manager: true,
  group: true,
} satisfies Prisma.ApplicationInclude;

type ApplicationWithRelations = Prisma.ApplicationGetPayload<{
  include: typeof LIST_INCLUDE;
}>;

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  /** Map an Application (with relations) into the legacy order shape the frontend consumes. */
  private toOrderDto(app: ApplicationWithRelations) {
    const { client, course, manager, group } = app;
    const fmt = course ? formatRef(course.format) : null;
    const typ = course ? typeRef(course.type) : null;
    const st = statusRef(app.status);
    return {
      id: app.id,
      name: client?.name ?? null,
      surname: client?.surname ?? null,
      email: client?.email ?? null,
      phone: client?.phone ?? null,
      age: client?.age ?? null,
      course: course ? { id: course.id, code: course.name } : null,
      format: fmt ? { id: fmt.id, name: fmt.name } : null,
      type: typ ? { id: typ.id, name: typ.name } : null,
      status: st ? { id: st.id, name: st.name } : null,
      manager: manager ? { id: manager.id, name: manager.name } : null,
      group: group ? { id: group.id, name: group.name } : null,
      sum: app.sum,
      alreadyPaid: app.alreadyPaid,
      utm: app.utm,
      message: app.message,
      created_at: app.createdAt,
    };
  }

  private buildWhere(
    query: OrderListQueryDto,
    currentUserId: string,
  ): Prisma.ApplicationWhereInput {
    const where: Prisma.ApplicationWhereInput = {};
    const client: Prisma.ClientWhereInput = {};
    const course: Prisma.CourseWhereInput = {};

    if (query.my_orders) where.managerId = currentUserId;
    if (query.name) client.name = { contains: query.name };
    if (query.surname) client.surname = { contains: query.surname };
    if (query.email) client.email = { contains: query.email };
    if (query.phone) client.phone = { contains: query.phone };
    if (Object.keys(client).length) where.client = client;

    const status = statusValueById(query.status_id);
    if (status) where.status = status;
    if (query.course_id) where.courseId = query.course_id;

    const format = formatValueById(query.format_id);
    if (format) course.format = format;
    const type = typeValueById(query.type_id);
    if (type) course.type = type;
    if (Object.keys(course).length) where.course = course;

    if (query.manager_id) where.managerId = query.manager_id;
    if (query.group_id) where.groupId = query.group_id;

    return where;
  }

  private buildOrderBy(
    sortBy: string,
    sortOrder: 'asc' | 'desc',
  ): Prisma.ApplicationOrderByWithRelationInput {
    switch (sortBy) {
      case 'id':
        return { id: sortOrder };
      case 'name':
        return { client: { name: sortOrder } };
      case 'surname':
        return { client: { surname: sortOrder } };
      case 'email':
        return { client: { email: sortOrder } };
      case 'phone':
        return { client: { phone: sortOrder } };
      case 'age':
        return { client: { age: sortOrder } };
      case 'course':
        return { course: { name: sortOrder } };
      case 'course_format':
        return { course: { format: sortOrder } };
      case 'course_type':
        return { course: { type: sortOrder } };
      case 'status':
        return { status: sortOrder };
      case 'manager':
        return { manager: { name: sortOrder } };
      case 'group':
        return { group: { name: sortOrder } };
      case 'sum':
        return { sum: sortOrder };
      case 'already_paid':
        return { alreadyPaid: sortOrder };
      default:
        return { createdAt: sortOrder };
    }
  }

  async findAll(query: OrderListQueryDto, currentUserId: string) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 25;
    const sortOrder: 'asc' | 'desc' =
      query.sortOrder === 'ASC' ? 'asc' : 'desc';
    const where = this.buildWhere(query, currentUserId);
    const orderBy = this.buildOrderBy(query.sortBy ?? 'created_at', sortOrder);

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.application.findMany({
        where,
        include: LIST_INCLUDE,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.application.count({ where }),
    ]);

    return { data: rows.map((row) => this.toOrderDto(row)), total };
  }

  async findOne(id: string) {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: {
        ...LIST_INCLUDE,
        comments: { include: { user: true }, orderBy: { createdAt: 'asc' } },
      },
    });
    if (!application) throw new NotFoundException('Order not found');
    return {
      ...this.toOrderDto(application),
      comments: application.comments.map((comment) => ({
        id: comment.id,
        orderId: comment.applicationId,
        userId: comment.userId,
        comment: comment.text,
        createdAt: comment.createdAt,
        user: comment.user
          ? {
              id: comment.user.id,
              name: comment.user.name,
              email: comment.user.email,
            }
          : undefined,
      })),
    };
  }

  /** Raw application (for permission checks / comment service). */
  async getRaw(id: string) {
    const application = await this.prisma.application.findUnique({
      where: { id },
    });
    if (!application) throw new NotFoundException('Order not found');
    return application;
  }

  async update(id: string, dto: UpdateOrderDto, currentUserId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id },
    });
    if (!application) throw new NotFoundException('Order not found');
    if (
      application.managerId != null &&
      application.managerId !== currentUserId
    ) {
      throw new ForbiddenException(
        'You can only edit orders without a manager or assigned to you',
      );
    }

    const clientData: Prisma.ClientUpdateInput = {};
    if (dto.name) clientData.name = dto.name;
    if (dto.surname) clientData.surname = dto.surname;
    if (dto.email) clientData.email = dto.email;
    if (dto.phone) clientData.phone = dto.phone;
    if (dto.age) clientData.age = dto.age;
    if (Object.keys(clientData).length) {
      await this.prisma.client.update({
        where: { id: application.clientId },
        data: clientData,
      });
    }

    const appData: Prisma.ApplicationUpdateInput = {};
    if (dto.course_id !== undefined) {
      appData.course =
        dto.course_id == null
          ? { disconnect: true }
          : { connect: { id: dto.course_id } };
    }
    if (dto.status_id !== undefined) {
      const status = statusValueById(dto.status_id);
      if (status) appData.status = status;
    }
    if (dto.manager_id !== undefined) {
      appData.manager =
        dto.manager_id == null
          ? { disconnect: true }
          : { connect: { id: dto.manager_id } };
    }
    if (dto.group_id !== undefined) {
      appData.group =
        dto.group_id == null
          ? { disconnect: true }
          : { connect: { id: dto.group_id } };
    }
    if (dto.sum !== undefined) appData.sum = dto.sum;
    if (dto.already_paid !== undefined) appData.alreadyPaid = dto.already_paid;
    if (dto.utm !== undefined) appData.utm = dto.utm;
    if (dto.message !== undefined) appData.message = dto.message;
    if (Object.keys(appData).length) {
      await this.prisma.application.update({ where: { id }, data: appData });
    }

    return this.findOne(id);
  }

  async exportExcel(
    query: OrderListQueryDto,
    currentUserId: string,
  ): Promise<Buffer> {
    const { data } = await this.findAll(
      { ...query, page: 1, limit: 10000 },
      currentUserId,
    );
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
