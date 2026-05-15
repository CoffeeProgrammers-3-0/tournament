import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {submissionService} from "../../../services/impl/SubmissionService";
import {categoryService} from "../../../services/impl/CategoryService";
import {juryCriteriaService} from "../../../services/impl/JuryCriteriaService";
import type {SubmissionFullResponseDto} from "../../../entities/submission/submission.dto.ts";
import type {CategoryResponseDto} from "../../../entities/category/category.dto.ts";
import type {JuryCriteriaResponseDto} from "../../../entities/juryCriteria/juryCriteria.dto.ts";

export interface CriteriaScoreForm {
    points: number | "";
    comment: string;
}

export interface CustomCriteriaForm {
    id: string | null;
    text: string;
    points: number | "";
    comment: string;
}

export const useJuryEvaluate = () => {
    const { submissionId } = useParams<{ submissionId: string }>();
    const subId = Number(submissionId);
    const { t } = useTranslation();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);

    const [submission, setSubmission] = useState<SubmissionFullResponseDto | null>(null);
    const [categories, setCategories] = useState<CategoryResponseDto[]>([]);

    const [scores, setScores] = useState<Record<number, CriteriaScoreForm>>({});
    const [existingScores, setExistingScores] = useState<Record<number, JuryCriteriaResponseDto>>({});
    const [customCriteria, setCustomCriteria] = useState<CustomCriteriaForm[]>(
        Array.from({ length: 4 }, (_) => ({ id: null, text: "", points: "", comment: "" }))
    );

    const fetchData = async () => {
        if (!subId) return;
        setLoading(true);
        try {
            const [subData, scoresData] = await Promise.all([
                submissionService.getSubmissionById(subId),
                juryCriteriaService.getMyScoresForSubmission(subId)
            ]);
            const catData = await categoryService.getCategories(subData.round.id);

            const scoresMap: Record<number, CriteriaScoreForm> = {};
            const existingMap: Record<number, JuryCriteriaResponseDto> = {};

            
            const fetchedCustom = scoresData.filter(sc => sc.additional).map(sc => {
                const match = sc.comment?.match(/^\[(.*?)\]\s*(.*)$/);
                return {
                    id: sc.id.toString(),
                    text: match ? match[1] : (sc.criteria?.text || ""),
                    points: sc.points,
                    comment: match ? match[2] : (sc.comment || "")
                };
            });

            
            const finalCustom: CustomCriteriaForm[] = Array.from({ length: 4 }, (_, i) => {
                return fetchedCustom[i] || { id: `temp-${i}`, text: "", points: "", comment: "" };
            });

            scoresData.forEach(sc => {
                if (!sc.additional && sc.criteria) {
                    scoresMap[sc.criteria.id] = { points: sc.points, comment: sc.comment || "" };
                    existingMap[sc.criteria.id] = sc;
                }
            });

            setSubmission(subData);
            setCategories(catData);
            setScores(scoresMap);
            setExistingScores(existingMap);
            setCustomCriteria(finalCustom);
        } catch (err) {
            setErrors([t('jury.errors.load_eval_failed')]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [subId]);

    const handleSaveScores = async () => {
        if (!subId || saving) return;
        setSaving(true);
        setErrors([]);

        try {
            const promises: any[] = [];

            
            categories.forEach(cat => {
                cat.criteria.forEach(crit => {
                    const score = scores[crit.id];
                    if (score && score.points !== "") {
                        promises.push(juryCriteriaService.setScore({
                            id: existingScores[crit.id]?.id || null,
                            submissionId: subId,
                            criteriaId: crit.id,
                            points: Number(score.points),
                            additional: false,
                            comment: score.comment
                        }));
                    }
                });
            });

            customCriteria.forEach(custom => {
                const hasData = custom.points !== "" || custom.text.trim() !== "";
                if (hasData) {
                    
                    const isNew = String(custom.id).startsWith('temp-');

                    promises.push(juryCriteriaService.setScore({
                        id: isNew ? null : Number(custom.id),
                        submissionId: subId,
                        criteriaId: null,
                        points: custom.points === "" ? 0 : Number(custom.points),
                        additional: true,
                        comment: `[${custom.text.trim()}] ${custom.comment}`
                    }));
                }
            });

            await Promise.all(promises);
            await fetchData(); 
            setShowSuccessDialog(true);
        } catch (err: any) {
            setErrors([t('jury.errors.save_failed')]);
        } finally {
            setSaving(false);
        }
    };

    const handleScoreChange = (criteriaId: number, field: keyof CriteriaScoreForm, value: any) => {
        setScores(prev => {
            const current = prev[criteriaId] || { points: "", comment: "" };

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
            }

            return { ...prev, [criteriaId]: { ...current } };
        });
    };

    const handleCustomCriteriaChange = (id: string, field: keyof CustomCriteriaForm, value: any) => {
        setCustomCriteria(prev => prev.map(criteria => {
            if (criteria.id !== id) return criteria;

            const updated = { ...criteria };
            if (field === "points") {
                if (value === "") {
                    updated.points = "";
                } else {
                    const numValue = parseInt(value, 10);
                    if (!isNaN(numValue)) {
                        
                        updated.points = Math.min(Math.max(numValue, 0), 5);
                    }
                }
            } else {
                (updated as any)[field] = value;
            }
            return updated;
        }));
    };

    return {
        submission, categories, scores, loading, saving, errors, setErrors,
        showSuccessDialog, setShowSuccessDialog, handleScoreChange, handleSaveScores, t,
        customCriteria, handleCustomCriteriaChange
    };
};