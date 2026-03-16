import BaseService from '../BaseService';
import type {UserCreateRequestDto, UserResponseDto, UserUpdateRequestDto} from "../../entities/user/user.dto.ts";
import type {PaginationListResponseDto} from "../../entities/wrappers/wrapper.dto.ts";

class UserService extends BaseService {
    constructor() {
        super('/api/users');
    }

    public createJury(data: UserCreateRequestDto): Promise<UserResponseDto> {
        return this.post<UserResponseDto>('/juries', data);
    }

    public updateUser(userId: number, data: UserUpdateRequestDto): Promise<UserResponseDto> {
        return this.put<UserResponseDto>(`/${userId}`, data);
    }

    public deleteUser(userId: number): Promise<void> {
        return this.delete<void>(`/${userId}`);
    }

    public getMyProfile(): Promise<UserResponseDto> {
        return this.get<UserResponseDto>('/my');
    }

    public getUserById(userId: number): Promise<UserResponseDto> {
        return this.get<UserResponseDto>(`/${userId}`);
    }

    public getJuries(params: {query?: string, page: number, size: number}): Promise<PaginationListResponseDto<UserResponseDto>> {
        return this.get<PaginationListResponseDto<UserResponseDto>>('/juries', { params });
    }
}

export const userService = new UserService();