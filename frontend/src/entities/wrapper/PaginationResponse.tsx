class PaginationResponse<T> {
    public totalPages: number;
    public content: T[]

    constructor(totalPages: number, content: T[]) {
        this.totalPages = totalPages;
        this.content = content;
    }
}

export default PaginationResponse;