import { api } from './client';

export interface Course { id: number; code: string; }
export interface CourseFormat { id: number; name: string; }
export interface CourseType { id: number; name: string; }
export interface Status { id: number; name: string; }
export interface Group { id: number; name: string; }

const referenceService = {
  async getCourses(): Promise<Course[]> {
    const { data } = await api.get<Course[]>('/courses');
    return data;
  },
  async getCourseFormats(): Promise<CourseFormat[]> {
    const { data } = await api.get<CourseFormat[]>('/course-formats');
    return data;
  },
  async getCourseTypes(): Promise<CourseType[]> {
    const { data } = await api.get<CourseType[]>('/course-types');
    return data;
  },
  async getStatuses(): Promise<Status[]> {
    const { data } = await api.get<Status[]>('/statuses');
    return data;
  },
  async getGroups(): Promise<Group[]> {
    const { data } = await api.get<Group[]>('/groups');
    return data;
  },
  async createGroup(name: string): Promise<Group> {
    const { data } = await api.post<Group>('/groups', { name });
    return data;
  },
};

export default referenceService;
