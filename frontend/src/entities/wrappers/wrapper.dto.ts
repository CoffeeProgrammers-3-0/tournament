export interface PasswordRequestDto {
    oldPassword: string;
    newPassword: string;
}

export interface StringRequestDto {
    text: string;
}

export interface LongResponseDto {
    count: number;
}

export interface PaginationListResponseDto<T> {
    totalPages: number;
    content: T[];
}