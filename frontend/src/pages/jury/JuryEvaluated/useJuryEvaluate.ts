import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {submissionService} from "../../../services/impl/SubmissionService";
import {categoryService} from "../../../services/impl/CategoryService";
import {juryCriteriaService} from "../../../services/impl/JuryCriteriaService";
import type {SubmissionFullResponseDto} from "../../../entities/submission/submission.dto.ts";
import type {CategoryResponseDto} from "../../../entities/category/category.dto.ts";
import type {JuryCriteriaRequestDto, JuryCriteriaResponseDto} from "../../../entities/juryCriteria/juryCriteria.dto.ts";

export interface CriteriaScoreForm {
    points: number | "";
    comment: string;
    additional: boolean;
}

export const useJuryEvaluate = () => {
    const { submissionId } = useParams<{ submissionId: string }>();
    const { t } = useTranslation();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);

    const [submission, setSubmission] = useState<SubmissionFullResponseDto | null>(null);
    const [categories, setCategories] = useState<CategoryResponseDto[]>([]);

    // Updated state to hold objects
    const [scores, setScores] = useState<Record<number, CriteriaScoreForm>>({});
    const [existingScores, setExistingScores] = useState<Record<number, JuryCriteriaResponseDto>>({});

    useEffect(() => {
        const fetchData = async () => {
            const id = Number(submissionId);

            if (!submissionId || isNaN(id) || id < 1) {
                window.location.replace('/404');
                return;
            }

            setLoading(true);
            setErrors([]);
            try {
                const [subData, scoresData] = await Promise.all([
                    submissionService.getSubmissionById(id),
                    juryCriteriaService.getMyScoresForSubmission(id)
                ]);

                const catData = await categoryService.getCategories(subData.round.id);

                const scoresMap: Record<number, CriteriaScoreForm> = {};
                const existingMap: Record<number, JuryCriteriaResponseDto> = {};

                scoresData.forEach(sc => {
                    scoresMap[sc.criteria.id] = {
                        points: sc.points,
                        comment: sc.comment || "",
                        additional: sc.additional || false
                    };
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

    // Calculate how many 'additional' bonuses are currently checked
    const additionalCount = Object.values(scores).filter(s => s.additional).length;

    // Updated handler to manage points, comments, and additional checkboxes
    const handleScoreChange = (criteriaId: number, field: keyof CriteriaScoreForm, value: any) => {
        setScores(prev => {
            const current = prev[criteriaId] || { points: "", comment: "", additional: false };

            if (field === "points") {
                if (value === "") {
                    current.points = "";
                } else {
                    const numValue = parseInt(value, 10);
                    if (!isNaN(numValue)) {
                        current.points = Math.min(Math.max(numValue, 0), 100);
                    }
                }
            } else if (field === "comment") {
                current.comment = value;
            } else if (field === "additional") {
                // Prevent checking if we already have 4, unless we are unchecking
                if (value === true && additionalCount >= 4) {
                    return prev;
                }
                current.additional = value;
            }

            return { ...prev, [criteriaId]: { ...current } };
        });
    };

    const handleSaveScores = async () => {
        if (!submissionId || !submission) return;

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
                    const scoreData = scores[criteria.id];
                    if (!scoreData || scoreData.points === "") continue;

                    const payload: JuryCriteriaRequestDto = {
                        points: scoreData.points as number,
                        additional: scoreData.additional,
                        comment: scoreData.comment
                    };

                    const existing = existingScores[criteria.id];

                    // Check if anything has actually changed
                    const hasChanged = !existing ||
                        existing.points !== payload.points ||
                        existing.additional !== payload.additional ||
                        existing.comment !== payload.comment;

                    if (hasChanged) {
                        promises.push(juryCriteriaService.updateScore(Number(submissionId), criteria.id, payload));
                    }
                }
            }

            if (promises.length > 0) {
                await Promise.all(promises);
            }
            setShowSuccessDialog(true);

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
        showSuccessDialog, setShowSuccessDialog, handleScoreChange, handleSaveScores,
        additionalCount, t
    };
};