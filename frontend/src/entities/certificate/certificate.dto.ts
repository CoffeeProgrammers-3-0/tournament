import type {UserResponseDto} from "../user/user.dto.ts";
import type {FileResponseDto} from "../file/file.dto.ts";
import type {TemplateResponseDto} from "../template/template.dto.ts";

export type CertificateStatus = "DRAFT" | "READY";


export interface CertificateResponseDto {
    id: number;
    receiver: UserResponseDto;
    creator: UserResponseDto;
    file: FileResponseDto;
    certificateTemplate: TemplateResponseDto;
    createdAt: string;
    status: CertificateStatus;
}