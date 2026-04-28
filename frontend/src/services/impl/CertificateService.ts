import BaseService from '../BaseService';
import type {CertificateResponseDto, CertificateStatus} from "../../entities/certificate/certificate.dto.ts";
import type {PaginationListResponseDto} from "../../entities/wrappers/wrapper.dto.ts";

interface PaginationParams {
    page: number;
    size: number;
}

class CertificateService extends BaseService {
    constructor() {
        super('/certificates');
    }

    // --- Generation Operations ---

    public generateSingle(
        templateId: number,
        fileName: string,
        receiverId: number,
        data: Record<string, any>
    ): Promise<CertificateResponseDto> {
        return this.post<CertificateResponseDto>('/generate/single', data, {
            params: { templateId, fileName, receiverId }
        });
    }

    public generateForTeams(
        templateId: number,
        roundId: number
    ): Promise<CertificateResponseDto[]> {
        return this.post<CertificateResponseDto[]>('/generate/teams', null, {
            params: { templateId, roundId }
        });
    }

    public generateForSpecificTeams(
        templateId: number,
        roundId: number,
        teamIds: number[]
    ): Promise<CertificateResponseDto[]> {
        return this.post<CertificateResponseDto[]>('/generate/teams-batch', teamIds, {
            params: { templateId, roundId }
        });
    }

    // --- Retrieval Operations ---

    public getCertificateMetaById(id: number): Promise<CertificateResponseDto> {
        return this.get<CertificateResponseDto>(`/${id}`);
    }

    public getMyCertificates(params: PaginationParams): Promise<PaginationListResponseDto<CertificateResponseDto>> {
        return this.get<PaginationListResponseDto<CertificateResponseDto>>('/my', { params });
    }

    public getCreatedByMeCertificates(params: PaginationParams): Promise<PaginationListResponseDto<CertificateResponseDto>> {
        return this.get<PaginationListResponseDto<CertificateResponseDto>>('/created-by-me', { params });
    }

    public getAllCertificates(params: PaginationParams): Promise<PaginationListResponseDto<CertificateResponseDto>> {
        return this.get<PaginationListResponseDto<CertificateResponseDto>>('', { params });
    }

    public getUserCertificates(userId: number, params: PaginationParams): Promise<PaginationListResponseDto<CertificateResponseDto>> {
        return this.get<PaginationListResponseDto<CertificateResponseDto>>(`/user/${userId}`, { params });
    }

    // --- Status Operations ---

    public updateStatus(id: number, status: CertificateStatus): Promise<CertificateResponseDto> {
        return this.patch<CertificateResponseDto>(`/${id}/status`, null, {
            params: { status }
        });
    }
}

export const certificateService = new CertificateService();