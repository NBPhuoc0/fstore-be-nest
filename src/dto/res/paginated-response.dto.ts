export class PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;

  constructor(
    data: T[],
    page: number,
    limit: number,
    totalCount: number,
    totalPages: number,
  ) {
    this.data = data;
    this.page = page;
    this.limit = limit;
    this.total = totalCount;
    this.totalPages = totalPages;
  }
}
