import BaseService from "../BaseService.ts";
import type { UserResponseDto, UserUpdateRequestDto } from "../../entities/user/user.dto.ts";

class UserService extends BaseService {
    constructor() {
        super("/users");
    }

    // GET /api/users/me — current authenticated user profile
    getMe(): Promise<UserResponseDto> {
        return this.get("/me");
    }

    // GET /api/users/{id}
    getById(id: number): Promise<UserResponseDto> {
        return this.get(`/${id}`);
    }

    // PUT /api/users/{id}
    update(id: number, data: UserUpdateRequestDto): Promise<UserResponseDto> {
        return this.put(`/${id}`, data);
    }

    // DELETE /api/users/{id}
    remove(id: number): Promise<void> {
        return this.delete(`/${id}`);
    }
}

export default new UserService();
