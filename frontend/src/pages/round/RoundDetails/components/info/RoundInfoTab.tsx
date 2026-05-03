import {Box, Button, Card, Divider, Grid, Paper, Stack, TextField, Typography} from "@mui/material";
import ReactQuill from "react-quill-new";
import type {RoundFullResponseDto} from "../../../../../entities/round/round.dto.ts";
import {toLocalInput} from "../../../../../utils/data.ts";

interface RoundInfoTabProps {
    state: {
        roundData: RoundFullResponseDto;
        isEditing: boolean;
        editFormData: any;
        setEditFormData: (data: any) => void;
        triggerConfirm: (options: any) => void;
        handleSaveMetadata: () => void;
        setIsEditing: (val: boolean) => void;
        actions: Record<string, () => Promise<void>>;
        isAdmin: boolean;
    };
    t: any;
}

export const RoundInfoTab = ({state, t}: RoundInfoTabProps) => {
    const {
        roundData,
        isEditing,
        editFormData,
        setEditFormData,
        triggerConfirm,
        actions,
        handleSaveMetadata,
        setIsEditing,
        isAdmin
    } = state;

    const getControlButtons = () => [
        {
            show: roundData.status === "DRAFT" && roundData.tournament.status === "RUNNING",
            label: t("round_details.actions.startRound"),
            color: "success" as const,
            variant: "contained" as const,
            action: () => triggerConfirm({
                title: t("round_details.confirm.start"),
                description: t("round_details.confirm.startDesc", "This will start the round."),
                confirmColor: "success",
                onConfirm: actions.start,
            }),
        },
        {
            show: roundData.status === "ACTIVE" && roundData.tournament.status === "RUNNING",
            label: t("round_details.actions.closeSubmissions"),
            color: "warning" as const,
            variant: "contained" as const,
            action: () => triggerConfirm({
                title: t("round_details.confirm.close"),
                description: t("round_details.confirm.closeDesc", "This will close submissions for the round."),
                confirmColor: "warning",
                onConfirm: actions.close,
            }),
        },
        {
            show: roundData.status === "ACTIVE" && roundData.tournament.status !== "FINISHED",
            label: t("round_details.actions.toDraft"),
            color: "error" as const,
            variant: "outlined" as const,
            action: () => triggerConfirm({
                title: t("round_details.confirm.toDraft"),
                description: t("round_details.confirm.toDraftDesc", "This will move the round back to draft."),
                confirmColor: "error",
                onConfirm: actions.toDraft,
            }),
        },
        {
            show: roundData.status === "SUBMISSION_CLOSED" && roundData.tournament.status === "RUNNING",
            label: t("round_details.actions.evaluate"),
            color: "primary" as const,
            variant: "contained" as const,
            action: () => triggerConfirm({
                title: t("round_details.confirm.evaluate"),
                description: t("round_details.confirm.evaluateDesc", "This will start evaluation."),
                confirmColor: "primary",
                onConfirm: actions.evaluate,
            }),
        },
        {
            show: roundData.status === "SUBMISSION_CLOSED" && roundData.tournament.status !== "FINISHED",
            label: t("round_details.actions.rollbackStart"),
            color: "warning" as const,
            variant: "outlined" as const,
            action: () => triggerConfirm({
                title: t("round_details.confirm.rollbackStart"),
                description: t("round_details.confirm.rollbackStartDesc", "This will revert the round start."),
                confirmColor: "warning",
                onConfirm: actions.rollbackStart,
            }),
        },
        {
            show: roundData.status === "EVALUATED" && roundData.tournament.status !== "FINISHED",
            label: t("round_details.actions.rollbackClose"),
            color: "warning" as const,
            variant: "outlined" as const,
            action: () => triggerConfirm({
                title: t("round_details.confirm.rollbackClose"),
                description: t("round_details.confirm.rollbackCloseDesc", "This will revert the submission close."),
                confirmColor: "warning",
                onConfirm: actions.rollbackClose,
            }),
        },
    ];

    return (
        <Grid container spacing={4}>
            <Grid size={{xs: 12, md: isAdmin ? 8 : 12}}>
                {isEditing ? (
                    <Stack spacing={3}>
                        <TextField
                            fullWidth
                            label={t("round_details.labels.name")}
                            value={editFormData.name ?? ""}
                            onChange={(e) => setEditFormData((prev: any) => ({...prev, name: e.target.value}))}
                        />

                        <Grid container spacing={2}>
                            <Grid size={{xs: 12, sm: 6}}>
                                <TextField
                                    fullWidth
                                    type="datetime-local"
                                    label={t("round_details.labels.startDate")}
                                    InputLabelProps={{shrink: true}}
                                    value={editFormData.startDate ?? ""}
                                    inputProps={{
                                        min: toLocalInput(roundData.tournament.startTournament).replace(' ', 'T') || undefined,
                                        max: editFormData.endDate ?? undefined
                                    }}
                                    onChange={(e) => setEditFormData((prev: any) => ({
                                        ...prev,
                                        startDate: e.target.value
                                    }))}
                                />
                            </Grid>

                            <Grid size={{xs: 12, sm: 6}}>
                                <TextField
                                    fullWidth
                                    type="datetime-local"
                                    disabled={roundData.status === "EVALUATED"}
                                    label={t("round_details.labels.endDate")}
                                    InputLabelProps={{shrink: true}}
                                    value={editFormData.endDate ?? ""}
                                    inputProps={{min: roundData.startDate}}
                                    onChange={(e) => setEditFormData((prev: any) => ({
                                        ...prev,
                                        endDate: e.target.value
                                    }))}
                                />
                            </Grid>
                        </Grid>

                        <Typography variant="subtitle2">{t("round_details.labels.task")}</Typography>
                        <ReactQuill
                            value={editFormData.task ?? ""}
                            onChange={(val) => setEditFormData((prev: any) => ({...prev, task: val}))}
                        />

                        <Typography variant="subtitle2">{t("round_details.labels.requirements")}</Typography>
                        <ReactQuill
                            value={editFormData.requirements ?? ""}
                            onChange={(val) => setEditFormData((prev: any) => ({...prev, requirements: val}))}
                        />

                        <Box sx={{display: "flex", gap: 2}}>
                            <Button variant="contained" onClick={handleSaveMetadata}>
                                {t("round_details.labels.save")}
                            </Button>
                            <Button variant="outlined" onClick={() => setIsEditing(false)}>
                                {t("round_details.labels.cancel")}
                            </Button>
                        </Box>
                    </Stack>
                ) : (
                    <Stack spacing={4}>
                        <Box>
                            <Typography variant="h6" fontWeight={700} color="primary">
                                {t("round_details.labels.task")}
                            </Typography>
                            <Paper variant="outlined" sx={{p: 2, mt: 1, bgcolor: "#fafafa"}}>
                                <Box
                                    dangerouslySetInnerHTML={{__html: roundData.task || t("round_details.labels.no_description")}}/>
                            </Paper>
                        </Box>

                        <Box>
                            <Typography variant="h6" fontWeight={700} color="error">
                                {t("round_details.labels.requirements")}
                            </Typography>
                            <Paper variant="outlined" sx={{p: 2, mt: 1, bgcolor: "#fafafa"}}>
                                <Box
                                    dangerouslySetInnerHTML={{__html: roundData.requirements || t("round_details.labels.no_requirements")}}/>
                            </Paper>
                        </Box>
                    </Stack>
                )}
            </Grid>

            {isAdmin &&
                <Grid size={{xs: 12, md: 4}}>
                    <Card sx={{p: 3, borderRadius: "24px", bgcolor: "#f8fafc"}}>
                        <Typography variant="subtitle2" fontWeight={800} mb={2}>
                            {t("round_details.labels.management")}
                        </Typography>

                        <Stack spacing={2}>
                            {getControlButtons().filter((b) => b.show).map((b, i) => (
                                <Button
                                    key={i}
                                    fullWidth
                                    variant={b.variant}
                                    color={b.color}
                                    onClick={b.action}
                                >
                                    {b.label}
                                </Button>
                            ))}

                            <Divider/>

                            <Button
                                fullWidth
                                color="error"
                                variant="outlined"
                                onClick={() => triggerConfirm({
                                    title: t("round_details.confirm.delete"),
                                    description: t("round_details.confirm.deleteDesc", "This will permanently delete the round."),
                                    confirmColor: "error",
                                    onConfirm: actions.delete,
                                })}
                            >
                                {t("round_details.labels.delete")}
                            </Button>
                        </Stack>
                    </Card>
                </Grid>
            }
        </Grid>
    );
};