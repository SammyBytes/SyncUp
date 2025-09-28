export class RepositoryResponseDto {
  id!: number;
  name!: string;
  full_name!: string;
  html_url!: string;
  private constructor() {}

  static create(data: Partial<RepositoryResponseDto>): RepositoryResponseDto {
    const instance = new RepositoryResponseDto();
    Object.assign(instance, data);
    return instance;
  }
}
