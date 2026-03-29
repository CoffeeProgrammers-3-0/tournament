import {useCallback, useEffect, useState} from "react";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Avatar,
    Box,
    Button,
    Chip,
    CircularProgress,
    Typography
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import GavelIcon from "@mui/icons-material/Gavel";
import {submissionService} from "../../../../../services/impl/SubmissionService";
import type {UserResponseDto} from "../../../../../entities/user/user.dto";
import type {SubmissionListResponseDto} from "../../../../../entities/submission/submission.dto";

type ItemProps = {
    submission: SubmissionListResponseDto;
    onAssignManual: (id: number) => void;
    onRemoveJury: (subId: number, juryId: number, callback: () => void) => void;
    t: any;
};

const SubmissionItem = ({ submission, onAssignManual, onRemoveJury, t }: ItemProps) => {
    const [expanded, setExpanded] = useState(false);
    const [juries, setJuries] = useState<UserResponseDto[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchJuries = useCallback(async () => {
        setLoading(true);
        try {
            const res = await submissionService.getJuriesBySubmission(submission.id, { page: 0, size: 50 });
            setJuries(res.content || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [submission.id]);

    useEffect(() => {
        if (expanded) fetchJuries();
    }, [expanded, fetchJuries]);

    return (
        <Accordion
            expanded={expanded}
            onChange={() => setExpanded(!expanded)}
            sx={{ borderRadius: "12px !important", border: "1px solid #eee", mb: 2, '&:before': { display: 'none' } }}
            elevation={0}
        >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center", pr: 2 }}>
                    <Box>
                        <Typography variant="subtitle1" fontWeight={700}>
                            Team: {submission.team?.name || `ID: ${submission.team?.id}`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Submission ID: #{submission.id}
                        </Typography>
                    </Box>
                    <Chip size="small" label="SUBMITTED" color="primary" variant="outlined" />
                </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ borderTop: "1px solid #f5f5f5" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                        {t("round_details.submissions.assigned_juries", "Assigned Juries")}
                    </Typography>
                    <Button
                        size="small"
                        startIcon={<PersonAddAlt1Icon />}
                        onClick={(e) => {
                            e.stopPropagation();
                            onAssignManual(submission.id);
                        }}
                    >
                        {t("round_details.submissions.assign_manual", "Assign")}
                    </Button>
                </Box>

                {loading ? (
                    <CircularProgress size={24} sx={{ display: "block", mx: "auto" }} />
                ) : (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {juries.length > 0 ? (
                            juries.map((j) => (
                                <Chip
                                    key={j.id}
                                    avatar={<Avatar><GavelIcon sx={{ fontSize: 14 }} /></Avatar>}
                                    label={j.fullName}
                                    onDelete={() => onRemoveJury(submission.id, j.id, fetchJuries)}
                                    color="warning"
                                />
                            ))
                        ) : (
                            <Typography variant="body2" color="text.disabled" sx={{ fontStyle: "italic" }}>
                                No juries assigned
                            </Typography>
                        )}
                    </Box>
                )}
            </AccordionDetails>
        </Accordion>
    );
};

export default SubmissionItem;