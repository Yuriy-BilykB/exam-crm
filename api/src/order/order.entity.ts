import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Course } from '../course/course.entity';
import { CourseFormat } from '../course-format/course-format.entity';
import { CourseType } from '../course-type/course-type.entity';
import { Status } from '../status/status.entity';
import { Group } from '../group/group.entity';
import { Comment } from '../comment/comment.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ length: 50, nullable: true })
  name: string;

  @Column({ length: 50, nullable: true })
  surname: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ type: 'int', nullable: true })
  age: number;

  @Column({ name: 'course_id', nullable: true })
  courseId: number;

  @ManyToOne(() => Course, (course) => course.orders, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @Column({ name: 'format_id', nullable: true })
  formatId: number;

  @ManyToOne(() => CourseFormat, (format) => format.orders, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'format_id' })
  format: CourseFormat;

  @Column({ name: 'type_id', nullable: true })
  typeId: number;

  @ManyToOne(() => CourseType, (type) => type.orders, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'type_id' })
  type: CourseType;

  @Column({ name: 'status_id', nullable: true })
  statusId: number;

  @ManyToOne(() => Status, (status) => status.orders, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'status_id' })
  status: Status;

  @Column({ name: 'manager_id', type: 'bigint', nullable: true })
  managerId: number | null;

  @ManyToOne(() => User, (user) => user.orders, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'manager_id' })
  manager: User | null;

  @Column({ name: 'group_id', nullable: true })
  groupId: number | null;

  @ManyToOne(() => Group, (group) => group.orders, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'group_id' })
  group: Group | null;

  @Column({ type: 'int', nullable: true })
  sum: number | null;

  @Column({ name: 'already_paid', type: 'int', nullable: true })
  alreadyPaid: number | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  utm: string | null;

  @Column({ type: 'text', nullable: true })
  message: string | null;

  @Column({ name: 'created_at', type: 'datetime', nullable: true })
  created_at: Date | null;

  @OneToMany(() => Comment, (comment) => comment.order)
  comments: Comment[];
}
