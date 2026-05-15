import {useCallback, useEffect, useState} from "react";
import {useNavigate,} from "react-router-dom";
import {useTranslation} from "react-i18next";

import {submissionService} from "../../services/impl/SubmissionService";
import {roundService} from "../../services/impl/RoundService";
import type {SubmissionFullResponseDto, SubmissionRequestDto} from "../../entities/submission/submission.dto.ts";
import type {RoundFullResponseDto} from "../../entities/round/round.dto.ts";


export const useTeamSubmission = (roundId?: string, submissionId?: string) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [errors, setErrors] = useState<string[]>([]); 
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const [existingSubmission, setExistingSubmission] = useState<SubmissionFullResponseDto | null>(null);
    const [roundData, setRoundData] = useState<RoundFullResponseDto | null>(null);
    const [formData, setFormData] = useState<SubmissionRequestDto>({
        githubLink: "", videoLink: "", description: "",
    });

    const isLocked = roundData?.status !== "ACTIVE";

    const fetchData = useCallback(async () => {
        setLoading(true);

        const id = Number(roundId);

        if (!roundId || isNaN(id) || id < 1) {
            window.location.replace('/404');
            return;
        }

        try {
            if (roundId) {
                const round = await roundService.getRoundById(Number(roundId));
                setRoundData(round);
            }
            if (submissionId) {
                const data = await submissionService.getSubmissionById(Number(submissionId));
                setExistingSubmission(data);
                setFormData({
                    githubLink: data.githubLink,
                    videoLink: data.videoLink,
                    description: data.description || ""
                });
            }
        } catch (err) {
            setErrors([t('submission.errors.load_failed')]);
        } finally {
            setLoading(false);
        }
    }, [roundId, submissionId, t]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLocked) return;
        setActionLoading(true);
        setErrors([]);
        setSuccessMsg(null);

        try {
            if (existingSubmission) {
                const updated = await submissionService.updateSubmission(existingSubmission.id, formData);
                setExistingSubmission(updated);
                setSuccessMsg(t('submission.success.updated'));
            } else {
                const created = await submissionService.sendSubmission(Number(roundId), formData);
                setExistingSubmission(created);
                setSuccessMsg(t('submission.success.created'));
            }
        } catch (err: any) {
            const messages = err.response?.data?.messages;
            setErrors(Array.isArray(messages) ? messages : [t('submission.errors.save_failed')]);
        } finally {
            setActionLoading(false);
        }
    };

    const deleteSubmission = async () => {
        if (!existingSubmission || isLocked) return;
        setActionLoading(true);
        try {
            await submissionService.deleteSubmission(existingSubmission.id);
            setExistingSubmission(null);
            setFormData({ githubLink: "", videoLink: "", description: "" });
            setSuccessMsg(t('submission.success.deleted'));
            return true;
        } catch (err: any) {
            setErrors([t('submission.errors.delete_failed')]);
            return false;
        } finally {
            setActionLoading(false);
        }
    };

    return {
        formData, setFormData, loading, actionLoading, errors, setErrors, successMsg,
        existingSubmission, roundData, isLocked, handleSubmit, deleteSubmission, navigate, t
    };
};