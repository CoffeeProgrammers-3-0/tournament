import type {FileResponseDto} from "../file/file.dto.ts";
import type {UserResponseDto} from "../user/user.dto.ts";

export interface TemplateResponseDto {
    id: number;
    uploader: UserResponseDto;
    file: FileResponseDto;
    createdAt: string;
    name: string;
}