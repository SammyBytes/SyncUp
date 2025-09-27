export class TaskResponseDto {
  id!: number;
  title!: string;
  body!: string;
  draft!: boolean;
  url!: string;
  state!: string;
  

  private constructor() {
    Object.seal(this);
  }

  static create(data: Partial<TaskResponseDto>): TaskResponseDto {
    const instance = new TaskResponseDto();
    Object.assign(instance, data);
    return instance;
  }
}
