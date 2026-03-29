import {Box, Button, Divider, Grid, MenuItem, Paper, TextField, Typography} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import DOMPurify from "dompurify";
import type {RoundFullResponseDto, RoundStatus, RoundUpdateRequestDto} from "../../../../entities/round/round.dto";
import {ErrorMessages} from "../../../../components/main/ErrorMessages.tsx";

// Налаштування панелі інструментів для редактора
const quillModules = {
    toolbar: [
        [{'header': [1, 2, 3, false]}],
        ['bold', 'italic', 'underline', 'strike'],
        [{'list': 'ordered'}, {'list': 'bullet'}],
        ['link', 'clean']
    ],
};

// Стилі для того, щоб Quill виглядав як частина MUI
const quillStyle = {
    '.ql-toolbar': {
        borderColor: 'rgba(0, 0, 0, 0.23)',
        borderRadius: '4px 4px 0 0',
        fontFamily: 'inherit',
    },
    '.ql-container': {
        borderColor: 'rgba(0, 0, 0, 0.23)',
        borderRadius: '0 0 4px 4px',
        fontSize: '1rem',
        minHeight: '150px',
        fontFamily: 'inherit',
    },
    '.ql-editor': {
        minHeight: '150px',
    }
};

type Props = {
    roundData: RoundFullResponseDto;
    isAdmin: boolean;
    isEditingInfo: boolean;
    editFormData: RoundUpdateRequestDto;
    setEditFormData: React.Dispatch<React.SetStateAction<RoundUpdateRequestDto>>;
    handleStatusChange: (newStatus: RoundStatus) => void;
    handleSaveUpdate: () => Promise<void>;
    cancelEditing: () => void;
    t: (key: string, options?: any) => string;
    errors: string[];
};

export const RoundInfoTab = ({
                                 roundData,
                                 isEditingInfo,
                                 editFormData,
                                 setEditFormData,
                                 handleStatusChange,
                                 handleSaveUpdate,
                                 cancelEditing,
                                 t,
    errors
                             }: Props) => {

    // Функція для безпечного рендерингу HTML
    const createMarkup = (html: string) => {
        return { __html: DOMPurify.sanitize(html) };
    };

    return (
        <Grid container spacing={4}>
            <ErrorMessages errors={errors}/>
            <Grid size={{ xs: 12, md: 8 }}>
                {isEditingInfo ? (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
                            <TextField
                                fullWidth
                                label={t("round_details.info.name")}
                                value={editFormData.name}
                                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                            />
                            <TextField
                                select
                                fullWidth
                                label={t("round_details.info.status")}
                                value={editFormData.status}
                                onChange={(e) => handleStatusChange(e.target.value as RoundStatus)}
                            >
                                <MenuItem value="DRAFT">{t("rounds.statuses.DRAFT")}</MenuItem>
                                <MenuItem value="ACTIVE">{t("rounds.statuses.ACTIVE")}</MenuItem>
                                <MenuItem value="SUBMISSION_CLOSED">{t("rounds.statuses.SUBMISSION_CLOSED")}</MenuItem>
                                <MenuItem value="EVALUATED">{t("rounds.statuses.EVALUATED")}</MenuItem>
                            </TextField>
                        </Box>

                        <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
                            <TextField
                                fullWidth
                                type="datetime-local"
                                label={t("round_details.info.start_date")}
                                InputLabelProps={{ shrink: true }}
                                value={editFormData.startDate}
                                onChange={(e) => setEditFormData({ ...editFormData, startDate: e.target.value })}
                            />
                            <TextField
                                fullWidth
                                type="datetime-local"
                                label={t("round_details.info.end_date")}
                                InputLabelProps={{ shrink: true }}
                                value={editFormData.endDate}
                                onChange={(e) => setEditFormData({ ...editFormData, endDate: e.target.value })}
                            />
                        </Box>

                        <TextField
                            fullWidth
                            type="number"
                            label={t("round_details.info.winners_count")}
                            value={editFormData.countOfWinners}
                            onChange={(e) => setEditFormData({ ...editFormData, countOfWinners: Number(e.target.value) })}
                        />

                        {/* Редактор для ЗАВДАННЯ */}
                        <Box sx={quillStyle}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', ml: 1 }}>
                                {t("round_details.info.task")}
                            </Typography>
                            <ReactQuill
                                theme="snow"
                                value={editFormData.task || ""}
                                modules={quillModules}
                                onChange={(val: any) => setEditFormData(prev => ({ ...prev, task: val }))}
                            />
                        </Box>

                        {/* Редактор для ВИМОГ */}
                        <Box sx={quillStyle}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', ml: 1 }}>
                                {t("round_details.info.requirements")}
                            </Typography>
                            <ReactQuill
                                theme="snow"
                                value={editFormData.requirements || ""}
                                modules={quillModules}
                                onChange={(val: any) => setEditFormData(prev => ({ ...prev, requirements: val }))}
                            />
                        </Box>

                        <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                            <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveUpdate} sx={{ fontWeight: 700 }}>
                                {t("round_details.admin.save")}
                            </Button>
                            <Button variant="outlined" onClick={cancelEditing}>
                                {t("round_details.admin.cancel")}
                            </Button>
                        </Box>
                    </Box>
                ) : (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <Box>
                            <Typography variant="h6" fontWeight={700} gutterBottom color="primary.main">
                                {t("round_details.info.task")}
                            </Typography>
                            <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fafafa', borderRadius: 2 }}>
                                <Typography
                                    component="div"
                                    sx={{
                                        lineHeight: 1.8,
                                        '& ul, & ol': { pl: 3 }, // Стилізація списків всередині HTML
                                        fontSize: '1.05rem'
                                    }}
                                    dangerouslySetInnerHTML={createMarkup(roundData.task || t("round_details.info.no_info"))}
                                />
                            </Paper>
                        </Box>

                        <Divider />

                        <Box>
                            <Typography variant="h6" fontWeight={700} gutterBottom color="error.main">
                                {t("round_details.info.requirements")}
                            </Typography>
                            <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fafafa', borderRadius: 2 }}>
                                <Typography
                                    component="div"
                                    sx={{
                                        lineHeight: 1.8,
                                        '& ul, & ol': { pl: 3 },
                                        fontSize: '1.05rem'
                                    }}
                                    dangerouslySetInnerHTML={createMarkup(roundData.requirements || t("round_details.info.no_info"))}
                                />
                            </Paper>
                        </Box>
                    </Box>
                )}
            </Grid>
        </Grid>
    );
};