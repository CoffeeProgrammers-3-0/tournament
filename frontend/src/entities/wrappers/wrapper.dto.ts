export interface PasswordRequestDto {
    oldPassword: string;
    newPassword: string;
}

export interface StringRequestDto {
    text: string;
}

export interface LongDto {
    count: number;
}

export interface PaginationListResponseDto<T> {
    totalPages: number;
    content: T[];
}