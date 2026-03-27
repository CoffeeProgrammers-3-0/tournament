import {Box, Button, CircularProgress, Pagination, Stack, Typography,} from "@mui/material";
import AutoModeIcon from "@mui/icons-material/AutoMode";
import type {SubmissionListResponseDto} from "../../../../entities/submission/submission.dto";
import SubmissionItem from "./SubmissionItem.tsx";

type Props = {
    tabValue: number;
    submissions: SubmissionListResponseDto[];
    loadingTab: boolean;
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onAutoAssign: () => void;
    onAssignManual: (submissionId: number) => void;
    onRemoveJury: (submissionId: number, juryId: number) => void; // ДОДАНО
    t: (key: string, options?: any) => string;
};

export const RoundSubmissionsTab = ({
                                        tabValue, submissions, loadingTab, page, totalPages,
                                        onPageChange, onAutoAssign, onAssignManual, onRemoveJury, t
                                    }: Props) => {
    if (tabValue !== 4) return null;

    return (
        <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3, alignItems: "center" }}>
                <Typography variant="h5" fontWeight={700}>{t("round_details.tabs.submissions")}</Typography>
                <Button variant="contained" color="secondary" startIcon={<AutoModeIcon />} onClick={onAutoAssign}>
                    {t("round_details.submissions.auto_assign")}
                </Button>
            </Box>

            {loadingTab ? (
                <CircularProgress sx={{ display: "block", mx: "auto", my: 4 }} />
            ) : (
                <Stack>
                    {submissions.map((sub) => (
                        <SubmissionItem
                            key={sub.id}
                            submission={sub}
                            onAssignManual={onAssignManual}
                            onRemoveJury={onRemoveJury}
                            t={t}
                        />
                    ))}
                    {totalPages > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                            <Pagination
                                count={totalPages}
                                page={page + 1}
                                onChange={(_, p) => onPageChange(p - 1)}
                                color="primary"
                            />
                        </Box>
                    )}
                </Stack>
            )}
        </Box>
    );
};