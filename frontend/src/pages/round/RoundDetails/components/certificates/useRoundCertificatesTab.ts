import {useCallback, useEffect, useMemo, useState} from 'react';
import type {CertificateResponseDto, CertificateStatus} from '../../../../../entities/certificate/certificate.dto.ts';
import type {TemplateResponseDto} from '../../../../../entities/template/template.dto.ts';
import {certificateService} from '../../../../../services/impl/CertificateService.ts';
import {certificateTemplateService} from '../../../../../services/impl/CertificateTemplateService.ts';

export type CertificateFieldKey =
    | 'fullName'
    | 'place'
    | 'isWinner'
    | 'points'
    | 'roundName'
    | 'tournamentName'
    | 'teamName'
    | 'certDate';

export const certificateFieldKeys: CertificateFieldKey[] = [
    'fullName',
    'place',
    'isWinner',
    'points',
    'roundName',
    'tournamentName',
    'teamName',
    'certDate'
];

export type CertificatesTabKey = 'my' | 'templates' | 'generate' | 'created';

export type TemplateBlockKey =
    | 'title'
    | 'subtitle'
    | 'participant'
    | 'metaRow'
    | 'divider'
    | 'footer'
    | 'signature';

export type TemplateBlock = {
    key: TemplateBlockKey;
    label: string;
    html: string;
};

export const templateBlocks: TemplateBlock[] = [
    {
        key: 'title',
        label: 'Title',
        html: `<div class="title" th:text="\${tournamentName}">Tournament Name</div>`,
    },
    {
        key: 'subtitle',
        label: 'Subtitle',
        html: `<div class="subtitle">Certificate of Achievement</div>`,
    },
    {
        key: 'participant',
        label: 'Participant',
        html: `<div class="name" th:text="\${fullName}">Participant Name</div>`,
    },
    {
        key: 'metaRow',
        label: 'Meta row',
        html: `<div class="meta">
  Team: <span th:text="\${teamName}">Team A</span>
</div>`,
    },
    {
        key: 'divider',
        label: 'Divider',
        html: `<hr style="border:0;border-top:1px solid #d1d5db;margin:24px 0;" />`,
    },
    {
        key: 'signature',
        label: 'Signature',
        html: `<div style="margin-top: 28px; text-align: right">
  <div class="muted">Status</div>
  <div th:text="\${isWinner} ? 'Winner' : 'Participant'">Winner</div>
</div>`,
    },
    {
        key: 'footer',
        label: 'Footer',
        html: `<div class="footer">
  <div>
    <div class="muted">Date</div>
    <div th:text="\${certDate}">2026-01-01</div>
  </div>
  <div style="text-align: right">
    <div class="muted">Round</div>
    <div th:text="\${roundName}">Final</div>
  </div>
</div>`,
    },
];

const PAGE_SIZE = 8;

const DEFAULT_THYMELEAF_TEMPLATE = `<!doctype html>
<html lang="en" xmlns:th="http://www.thymeleaf.org">
<head>
  <meta charset="UTF-8" />
  <meta name="pdf-width" content="210mm"/>
  <meta name="pdf-height" content="148mm"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Certificate</title>
  <style>
    body {
      margin: 0;
      font-family: Georgia, "Times New Roman", serif;
      background: #f3f4f6;
    }

    .canvas {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      box-sizing: border-box;
    }

    .certificate {
      width: 1000px;
      min-height: 700px;
      background: #fff;
      border: 10px solid #111827;
      padding: 60px;
      box-sizing: border-box;
      position: relative;
      text-align: center;
    }

    .title {
      font-size: 52px;
      font-weight: 700;
      margin-bottom: 14px;
    }

    .subtitle {
      font-size: 22px;
      color: #6b7280;
      margin-bottom: 40px;
    }

    .name {
      font-size: 40px;
      font-weight: 700;
      margin: 12px 0 34px;
    }

    .meta {
      font-size: 18px;
      margin: 10px 0;
    }

    .footer {
      position: absolute;
      bottom: 40px;
      left: 60px;
      right: 60px;
      display: flex;
      justify-content: space-between;
      font-size: 16px;
    }

    .muted {
      color: #6b7280;
      font-size: 14px;
      margin-bottom: 4px;
    }
  </style>
</head>
<body>
  <div class="canvas">
    <div class="certificate">

      <div class="title" th:text="\${tournamentName}">Tournament Name</div>
      <div class="subtitle">Certificate of Achievement</div>

      <div class="name" th:text="\${fullName}">Participant Name</div>

      <div class="meta">Team: <span th:text="\${teamName}">Team A</span></div>
      <div class="meta">Round: <span th:text="\${roundName}">Final</span></div>
      <div class="meta">Place: <span th:text="\${place}">1</span></div>
      <div class="meta">Points: <span th:text="\${points}">100</span></div>
      <div class="meta">
        Status:
        <span th:text="\${isWinner} ? 'Winner' : 'Participant'">Winner</span>
      </div>

      <div class="footer">
        <div>
          <div class="muted">Date</div>
          <div th:text="\${certDate}">2026-01-01</div>
        </div>

        <div>
          <div class="muted">Round</div>
          <div th:text="\${roundName}">Final</div>
        </div>
      </div>

    </div>
  </div>
</body>
</html>`;

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8081';

const API_CONFIG = {
    BASE_URL: API_BASE.replace(/\/api\/?$/, '')
};

const slugify = (value: string): string =>
    value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const downloadTextFile = (fileName: string, text: string, mime = 'text/html;charset=utf-8') => {
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
};

export interface UseRoundCertificatesTabParams {
    roundId: number;
    isAdmin?: boolean;
}

export function useRoundCertificatesTab({ roundId, isAdmin = false }: UseRoundCertificatesTabParams) {
    const [activeTab, setActiveTab] = useState<CertificatesTabKey>('my');

    const [myCertificates, setMyCertificates] = useState<CertificateResponseDto[]>([]);
    const [createdCertificates, setCreatedCertificates] = useState<CertificateResponseDto[]>([]);
    const [templates, setTemplates] = useState<TemplateResponseDto[]>([]);

    const [myPage, setMyPage] = useState(0);
    const [createdPage, setCreatedPage] = useState(0);
    const [templatesPage, setTemplatesPage] = useState(0);

    const [myTotalPages, setMyTotalPages] = useState(0);
    const [createdTotalPages, setCreatedTotalPages] = useState(0);
    const [templatesTotalPages, setTemplatesTotalPages] = useState(0);

    const [loadingMy, setLoadingMy] = useState(false);
    const [loadingCreated, setLoadingCreated] = useState(false);
    const [loadingTemplates, setLoadingTemplates] = useState(false);
    const [savingTemplate, setSavingTemplate] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const [templateName, setTemplateName] = useState('');
    const [templateDraft, setTemplateDraft] = useState(DEFAULT_THYMELEAF_TEMPLATE);
    const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
    const [teamIdsText, setTeamIdsText] = useState('');

    const fetchMyCertificates = useCallback(async () => {
        setLoadingMy(true);
        try {
            const response = await certificateService.getMyCertificates({
                page: myPage,
                size: PAGE_SIZE,
            });
            setMyCertificates(response.content);
            setMyTotalPages(response.totalPages);
        } finally {
            setLoadingMy(false);
        }
    }, [myPage]);

    const fetchCreatedCertificates = useCallback(async () => {
        if (!isAdmin) return;

        setLoadingCreated(true);
        try {
            const response = await certificateService.getCreatedByMeCertificates({
                page: createdPage,
                size: PAGE_SIZE,
            });
            setCreatedCertificates(response.content);
            setCreatedTotalPages(response.totalPages);
        } finally {
            setLoadingCreated(false);
        }
    }, [createdPage, isAdmin]);

    const fetchTemplates = useCallback(async () => {
        if (!isAdmin) return;

        setLoadingTemplates(true);
        try {
            const response = await certificateTemplateService.getTemplates({
                page: templatesPage,
                size: PAGE_SIZE,
            });
            setTemplates(response.content);
            setTemplatesTotalPages(response.totalPages);

            if (response.content.length > 0 && selectedTemplateId === null) {
                setSelectedTemplateId(response.content[0].id);
            }
        } finally {
            setLoadingTemplates(false);
        }
    }, [isAdmin, templatesPage, selectedTemplateId]);

    const refreshAll = useCallback(async () => {
        await Promise.all([
            fetchMyCertificates(),
            isAdmin ? fetchCreatedCertificates() : Promise.resolve(),
            isAdmin ? fetchTemplates() : Promise.resolve(),
        ]);
    }, [fetchCreatedCertificates, fetchMyCertificates, fetchTemplates, isAdmin]);

    useEffect(() => {
        fetchMyCertificates();
    }, [fetchMyCertificates]);

    useEffect(() => {
        if (!isAdmin) return;
        fetchCreatedCertificates();
        fetchTemplates();
    }, [fetchCreatedCertificates, fetchTemplates, isAdmin]);

    const downloadExampleTemplate = useCallback(() => {
        downloadTextFile('certificate-example.html', DEFAULT_THYMELEAF_TEMPLATE);
    }, []);

    const downloadCurrentTemplateDraft = useCallback(() => {
        const fileName = `${slugify(templateName || 'certificate-draft')}.html`;
        downloadTextFile(fileName, templateDraft);
    }, [templateDraft, templateName]);

    const resetTemplateDraft = useCallback(() => {
        setTemplateName('');
        setTemplateDraft(DEFAULT_THYMELEAF_TEMPLATE);
    }, []);

    const saveTemplateDraft = useCallback(async () => {
        if (!templateName.trim()) {
            throw new Error('Template name is required');
        }

        setSavingTemplate(true);
        try {
            const fileName = `${slugify(templateName)}.html`;
            const file = new File([templateDraft], fileName, { type: 'text/html;charset=utf-8' });

            await certificateTemplateService.uploadTemplate(file, templateName.trim());

            setTemplateName('');
            setTemplateDraft(DEFAULT_THYMELEAF_TEMPLATE);
            await fetchTemplates();
        } finally {
            setSavingTemplate(false);
        }
    }, [fetchTemplates, templateDraft, templateName]);

    const uploadExistingTemplateFile = useCallback(
        async (file: File, name?: string) => {
            setSavingTemplate(true);
            try {
                await certificateTemplateService.uploadTemplate(file, name?.trim() || undefined);
                await fetchTemplates();
            } finally {
                setSavingTemplate(false);
            }
        },
        [fetchTemplates],
    );

    const generateForRound = useCallback(async () => {
        if (!selectedTemplateId) {
            throw new Error('Template is not selected');
        }

        setGenerating(true);
        try {
            await certificateService.generateForTeams(selectedTemplateId, roundId);
            await refreshAll();
        } finally {
            setGenerating(false);
        }
    }, [refreshAll, roundId, selectedTemplateId]);

    const generateForSelectedTeams = useCallback(async () => {
        if (!selectedTemplateId) {
            throw new Error('Template is not selected');
        }

        const teamIds = teamIdsText
            .split(',')
            .map((item) => Number(item.trim()))
            .filter((item) => Number.isFinite(item) && item > 0);

        if (teamIds.length === 0) {
            throw new Error('Provide at least one team id');
        }

        setGenerating(true);
        try {
            await certificateService.generateForSpecificTeams(selectedTemplateId, roundId, teamIds);
            await refreshAll();
        } finally {
            setGenerating(false);
        }
    }, [refreshAll, roundId, selectedTemplateId, teamIdsText]);

    const updateCertificateStatus = useCallback(
        async (id: number, status: CertificateStatus) => {
            setUpdatingStatus(true);
            try {
                await certificateService.updateStatus(id, status);
                await refreshAll();
            } finally {
                setUpdatingStatus(false);
            }
        },
        [refreshAll],
    );

    const downloadCertificate = useCallback((certificate: CertificateResponseDto) => {
        if (certificate.status !== 'READY' && !isAdmin) return;

        const path = certificate.file?.path;
        if (!path) return;

        const fullUrl = `${API_CONFIG.BASE_URL}${path}`;

        const link = document.createElement('a');
        link.href = fullUrl;
        link.target = '_blank';
        link.rel = 'noreferrer';

        document.body.appendChild(link);
        link.click();
        link.remove();
    }, []);

    const selectedTemplate = useMemo(
        () => templates.find((item) => item.id === selectedTemplateId) ?? null,
        [selectedTemplateId, templates],
    );

    return {
        activeTab,
        setActiveTab,

        isAdmin,

        myCertificates,
        createdCertificates,
        templates,
        selectedTemplate,

        myPage,
        setMyPage,
        createdPage,
        setCreatedPage,
        templatesPage,
        setTemplatesPage,

        myTotalPages,
        createdTotalPages,
        templatesTotalPages,

        loadingMy,
        loadingCreated,
        loadingTemplates,
        savingTemplate,
        generating,
        updatingStatus,

        templateName,
        setTemplateName,
        templateDraft,
        setTemplateDraft,
        selectedTemplateId,
        setSelectedTemplateId,
        teamIdsText,
        setTeamIdsText,

        refreshAll,
        downloadExampleTemplate,
        downloadCurrentTemplateDraft,
        resetTemplateDraft,
        saveTemplateDraft,
        uploadExistingTemplateFile,
        generateForRound,
        generateForSelectedTeams,
        downloadCertificate,
        updateCertificateStatus,
    };
}