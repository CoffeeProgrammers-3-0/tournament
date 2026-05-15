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

const DEFAULT_THYMELEAF_TEMPLATE = `<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8"/>
    <meta name="pdf-width" content="210mm"/>
    <meta name="pdf-height" content="148mm"/>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap');

        body {
            margin: 0;
            padding: 0;
            font-family: 'Montserrat', sans-serif;
        }

        .certificate-container {
            width: 210mm;
            height: 148mm;
            background: white;
            position: relative;
            margin: auto;
            display: flex;
            flex-direction: column;
            padding: 60px 80px; /* Немного уменьшил padding сверху */
            box-sizing: border-box;
            overflow: hidden;
        }

        .decor {
            position: absolute;
            right: -50px;
            top: 20%;
            width: 500px;
            height: 600px;
            background: 
                radial-gradient(circle at right, rgba(255,215,0,0.2), transparent 70%),
                radial-gradient(circle at top right, rgba(244,67,54,0.15), transparent 60%),
                radial-gradient(circle at bottom right, rgba(76,175,80,0.15), transparent 60%);
            filter: blur(50px);
            z-index: 1;
        }

        .content {
            position: relative;
            z-index: 2;
        }

        .header-box {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
        }

        h1 {
            color: #007bbd;
            font-size: 60px;
            margin: 0;
            font-weight: 700;
            text-transform: uppercase;
        }

        .tournament-info {
            font-size: 14px;
            color: #555;
            text-align: right;
            font-weight: 700;
            text-transform: uppercase;
        }

        .recipient-name {
            font-size: 36px;
            font-weight: 700;
            margin: 20px 0 5px 0;
            text-transform: uppercase;
            border-bottom: 2px solid #000;
            display: inline-block;
            width: 100%;
        }

        .team-name {
            font-size: 18px;
            color: #007bbd;
            margin-bottom: 20px;
            font-weight: 700;
        }

        .description {
            font-size: 18px;
            max-width: 680px;
            line-height: 1.4;
            margin-top: 20px;
            color: #333;
        }

        .stats-badge {
            margin-top: 15px;
            display: inline-block;
            background: #f0f0f0;
            padding: 8px 15px;
            border-radius: 5px;
            font-weight: 700;
        }

        .winner-tag {
            color: #d4af37; /* Gold color */
            text-transform: uppercase;
            margin-left: 10px;
        }

        .footer {
            margin-top: auto;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }

        .date-block {
            margin-bottom: 20px;
            font-size: 16px;
            color: #555;
        }

        .signer-name {
            color: #007bbd;
            font-weight: 700;
            font-size: 18px;
        }

        .signature-wrap {
            text-align: center;
        }

        .signature-line {
            width: 200px;
            border-bottom: 1px solid #000;
            margin-bottom: 5px;
            height: 40px;
            position: relative;
        }

        .sig-font {
            font-family: cursive;
            font-size: 24px;
            color: #1a237e;
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
        }
    </style>
</head>
<body>

<div class="certificate-container">
    <div class="decor"></div>

    <div class="content">
        <div class="header-box">
            <h1 th:text="\${isWinner} ? 'CERTIFICATE' : 'GRATITUDE'">isWinner</h1>
            <div class="tournament-info">
                <div th:text="\${tournamentName}">tournamentName</div>
                <div th:text="\${roundName}">roundName</div>
            </div>
        </div>
        
        <div class="recipient-name" th:text="\${fullName}">
            fullName
        </div>
        <div class="team-name">
            Team: <span th:text="\${teamName}">teamName</span>
        </div>

        <p class="description">
            For outstanding performance and dedication during the competition. Your hard work and spirit contributed to the success of the event.
        </p>

        <div class="stats-badge">
            Result: <span th:text="\${place}">1</span> place 
            (<span th:text="\${points}">points</span> pts)
            <span th:if="\${isWinner}" class="winner-tag">isWinner</span>
        </div>
    </div>

    <div class="footer">
        <div class="info-side">
            <div class="date-block">
                Date: <span th:text="\${certDate}">certDate</span>
            </div>
            
            <div class="signer-name">Denis Volovyk</div>
            <div>Executive Director</div>
            <div>Star for Life Ukraine</div>
        </div>

        <div class="signature-wrap">
            <div class="signature-line">
                <span class="sig-font">Volovyk</span>
            </div>
            <div style="font-size: 12px;">Signature</div>
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
            const response = isAdmin ? await certificateService.getCreatedByMeCertificates({
                    page: myPage,
                    size: PAGE_SIZE,})
                : await certificateService.getMyCertificates({
                    page: myPage,
                    size: PAGE_SIZE,});
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
            const response = await certificateService.getAllCertificates({
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