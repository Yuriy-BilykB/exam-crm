import { UserResponse } from '../../user/dto/user.dto';

export class ManagerStatsResponse {
  statusName: string;
  count: number;
}

export class ResponseDtoManagers {
  data: (UserResponse & { stats: ManagerStatsResponse[] })[];
  total: number;
}
