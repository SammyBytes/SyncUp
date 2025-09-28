export class TaskResponseDto {
  id!: number;
  title!: string;
  body: string | null = null;
  draft!: boolean;
  url!: string;
  state!: string;

  private constructor() {}

  static create(data: Partial<TaskResponseDto>): TaskResponseDto {
    const instance = new TaskResponseDto();
    Object.assign(instance, data);
    return instance;
  }
}
