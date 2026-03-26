import {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {submissionService} from "../../../services/impl/SubmissionService";
import type {SubmissionListResponseDto} from "../../../entities/submission/submission.dto.ts";

export const useJurySubmissions = () => {
    const { t } = useTranslation();
    const [submissions, setSubmissions] = useState<SubmissionListResponseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSubmissions = async () => {
            setLoading(true);
            try {
                // Завантажуємо список робіт, призначених поточному журі
                const response = await submissionService.getSubmissionsForJury({ page: 0, size: 50 });
                setSubmissions(response.content || []);
                setError(null);
            } catch (err: any) {
                console.error("Failed to fetch jury submissions", err);
                setError(t('jury.errors.load_list_failed'));
            } finally {
                setLoading(false);
            }
        };

        fetchSubmissions();
    }, [t]);

    return { submissions, loading, error, t };
};