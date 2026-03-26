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
    const [submission, setSubmission] = useState<SubmissionFullResponseDto | null>(null);
    const [categories, setCategories] = useState<CategoryResponseDto[]>([]);
    const [scores, setScores] = useState<Record<number, number>>({});
    const [existingScores, setExistingScores] = useState<Record<number, JuryCriteriaResponseDto>>({});
    const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!submissionId) return;
            try {
                const subData = await submissionService.getSubmissionById(Number(submissionId));
                const catData = await categoryService.getCategories(subData.round.id);
                const scoresData = await juryCriteriaService.getMyScoresForSubmission(Number(submissionId));

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
                setStatus({ type: 'error', msg: t('jury.errors.load_eval_failed') });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [submissionId, t]);

    const handleScoreChange = (criteriaId: number, value: string) => {
        const numValue = parseInt(value, 10);
        if (isNaN(numValue)) return;
        setScores(prev => ({ ...prev, [criteriaId]: Math.min(Math.max(numValue, 0), 100) }));
    };

    const handleSaveScores = async () => {
        if (!submissionId) return;
        setSaving(true);
        setStatus(null);

        try {
            const promises = [];
            for (const category of categories) {
                for (const criteria of category.criteria) {
                    const points = scores[criteria.id];
                    if (points === undefined) continue;

                    const payload = { count: points };
                    if (existingScores[criteria.id]) {
                        if (existingScores[criteria.id].points !== points) {
                            promises.push(juryCriteriaService.updateScore(Number(submissionId), criteria.id, payload));
                        }
                    } else {
                        promises.push(juryCriteriaService.setScore(Number(submissionId), criteria.id, payload));
                    }
                }
            }
            await Promise.all(promises);
            setStatus({ type: 'success', msg: t('jury.success.scores_saved') });

            // Оновлення стану після успішного збереження
            const updatedScores = await juryCriteriaService.getMyScoresForSubmission(Number(submissionId));
            const newExistingMap: Record<number, JuryCriteriaResponseDto> = {};
            updatedScores.forEach(sc => newExistingMap[sc.criteria.id] = sc);
            setExistingScores(newExistingMap);
        } catch (err) {
            setStatus({ type: 'error', msg: t('jury.errors.save_failed') });
        } finally {
            setSaving(false);
        }
    };

    return { submission, categories, scores, loading, saving, status, handleScoreChange, handleSaveScores, t };
};