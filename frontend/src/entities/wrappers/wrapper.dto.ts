export interface PasswordRequestDto {
    oldPassword: string;
    newPassword: string;
}

export interface StringRequestDto {
    text: string;
}

export interface LongDto {
    value: number;
}

export interface PaginationListResponseDto<T> {
    totalPages: number;
    content: T[];
}