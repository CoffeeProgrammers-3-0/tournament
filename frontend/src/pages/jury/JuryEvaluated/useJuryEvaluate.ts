import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {submissionService} from "../../../services/impl/SubmissionService";
import {categoryService} from "../../../services/impl/CategoryService";
import {juryCriteriaService} from "../../../services/impl/JuryCriteriaService";
import type {SubmissionFullResponseDto} from "../../../entities/submission/submission.dto.ts";
import type {CategoryResponseDto} from "../../../entities/category/category.dto.ts";
import type {JuryCriteriaResponseDto} from "../../../entities/juryCriteria/juryCriteria.dto.ts";

export const useJuryEvaluate = () => {
    const { submissionId } = useParams<{ submissionId: string }>();
    const { t } = useTranslation();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);

    const [submission, setSubmission] = useState<SubmissionFullResponseDto | null>(null);
    const [categories, setCategories] = useState<CategoryResponseDto[]>([]);
    const [scores, setScores] = useState<Record<number, number>>({});
    const [existingScores, setExistingScores] = useState<Record<number, JuryCriteriaResponseDto>>({});

    useEffect(() => {
        const fetchData = async () => {
            if (!submissionId) return;
            setLoading(true);
            setErrors([]);
            try {
                const [subData, scoresData] = await Promise.all([
                    submissionService.getSubmissionById(Number(submissionId)),
                    juryCriteriaService.getMyScoresForSubmission(Number(submissionId))
                ]);

                const catData = await categoryService.getCategories(subData.round.id);

                const scoresMap: Record<number, number> = {};
                const existingMap: Record<number, JuryCriteriaResponseDto> = {};

                scoresData.forEach(sc => {
                    scoresMap[sc.criteria.id] = sc.points;
                    existingMap[sc.criteria.id] = sc;
                });

                setSubmission(subData);
                setCategories(catData);
                setScores(scoresMap);
                setExistingScores(existingMap);
            } catch (err) {
                setErrors([t('jury.errors.load_eval_failed')]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [submissionId, t]);

    const handleScoreChange = (criteriaId: number, value: string) => {
        const numValue = parseInt(value, 10);
        if (value === "") {
            setScores(prev => {
                const next = { ...prev };
                delete next[criteriaId];
                return next;
            });
            return;
        }
        if (isNaN(numValue)) return;
        setScores(prev => ({ ...prev, [criteriaId]: Math.min(Math.max(numValue, 0), 100) }));
    };

    const handleSaveScores = async () => {
        if (!submissionId || !submission) return;

        // Додатковий запобіжник на фронтенді: не даємо зберегти, якщо статус EVALUATED
        if (submission.round.status === "EVALUATED") {
            setErrors([t('jury.errors.round_closed', 'Оцінювання для цього раунду вже завершено.')]);
            return;
        }

        setSaving(true);
        setErrors([]);

        try {
            const promises = [];
            for (const category of categories) {
                for (const criteria of category.criteria) {
                    const points = scores[criteria.id];
                    if (points === undefined) continue;

                    const payload = { value: points };
                    // Оновлюємо тільки якщо значення змінилося або ще не існує
                    if (!existingScores[criteria.id] || existingScores[criteria.id].points !== points) {
                        promises.push(juryCriteriaService.updateScore(Number(submissionId), criteria.id, payload));
                    }
                }
            }

            if (promises.length > 0) {
                await Promise.all(promises);
            }
            setShowSuccessDialog(true);

            // Рефреш локальних даних
            const updatedScores = await juryCriteriaService.getMyScoresForSubmission(Number(submissionId));
            const newExistingMap: Record<number, JuryCriteriaResponseDto> = {};
            updatedScores.forEach(sc => newExistingMap[sc.criteria.id] = sc);
            setExistingScores(newExistingMap);
        } catch (err: any) {
            const messages = err.response?.data?.messages;
            setErrors(Array.isArray(messages) ? messages : [t('jury.errors.save_failed')]);
        } finally {
            setSaving(false);
        }
    };

    return {
        submission, categories, scores, loading, saving, errors, setErrors,
        showSuccessDialog, setShowSuccessDialog, handleScoreChange, handleSaveScores, t
    };
};