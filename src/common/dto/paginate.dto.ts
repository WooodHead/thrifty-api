import { IsInt, Min } from "class-validator";
import { Type } from "class-transformer";

export class PaginateDto {
    @IsInt()
    @Type(() => Number)
    @Min(1, { message: 'page must be greater than 1' })
    readonly page: number;

    @IsInt()
    @Type(() => Number)
    readonly limit: number

    constructor(page: number, limit: number) {
        this.page = page;
        this.limit = limit;
    }

    get skip(): number {
        return (this.page - 1) * this.limit;
    }

    get take(): number {
        return this.limit;
    }

};

export class PaginateMetaDto {
    readonly total: number;
    readonly page: number;
    readonly limit: number;
    readonly pages: number;

    constructor(total: number, page: number, limit: number) {
        this.total = total;
        this.page = page;
        this.limit = limit;
        this.pages = Math.ceil(total / limit);
    }

    get hasNext(): boolean {
        return this.page < this.pages;
    }

    get hasPrev(): boolean {
        return this.page > 1;
    }

    get nextPage(): number {
        return this.hasNext ? this.page + 1 : this.pages;
    }

    get prevPage(): number {
        return this.hasPrev ? this.page - 1 : 1;
    }

    get hasPages(): boolean {
        return this.pages > 1;
    }

    get hasFirst(): boolean {
        return this.hasPages && this.page > 1;
    }

    get hasLast(): boolean {
        return this.hasPages && this.page < this.pages;
    }

    get firstPage(): number {
        return 1;
    }

    get lastPage(): number {
        return this.pages;
    }

    get firstItem(): number {
        return this.page === 1 ? 1 : (this.page - 1) * this.limit + 1;
    }

    get lastItem(): number {
        return this.page === this.pages ? this.total : this.page * this.limit;
    }

    get hasItems(): boolean {
        return this.total > 0;
    }
}