import BaseService from '../BaseService';
import type {TemplateResponseDto} from "../../entities/template/template.dto.ts";
import type {PaginationListResponseDto} from "../../entities/wrappers/wrapper.dto.ts";

interface TemplateQueryParams {
    page: number;
    size: number;
    search?: string;
}

class CertificateTemplateService extends BaseService {
    constructor() {
        super('/certificate-templates');
    }

    public getTemplates(params: TemplateQueryParams): Promise<PaginationListResponseDto<TemplateResponseDto>> {
        return this.get<PaginationListResponseDto<TemplateResponseDto>>('', { params });
    }

    public uploadTemplate(file: File, name?: string): Promise<TemplateResponseDto> {
        const formData = new FormData();
        formData.append('file', file);

        const params: Record<string, string> = {};
        if (name) {
            params.name = name;
        }

        return this.post<TemplateResponseDto>('', formData, {
            params,
            headers: {
                // Let the browser automatically set the correct Content-Type with the multipart boundary
                'Content-Type': 'multipart/form-data'
            }
        });
    }
}

export const certificateTemplateService = new CertificateTemplateService();