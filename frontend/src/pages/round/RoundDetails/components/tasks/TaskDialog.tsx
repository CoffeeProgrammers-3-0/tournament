import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import {ErrorMessages} from "../../../../../components/main/ErrorMessages";
import type {TeamTaskRequestDto} from "../../../../../entities/teamTask/teamtask.dto";
import {TASK_PRIORITIES, TASK_STATUSES, TASK_TYPES} from "../../../../../entities/teamTask/teamtask.dto";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

interface Props {
    open: boolean;
    onClose: () => void;
    formData: TeamTaskRequestDto;
    setFormData: React.Dispatch<React.SetStateAction<TeamTaskRequestDto>>;
    onSubmit: () => void;
    isLoading: boolean;
    t: any;
    errors: string[];
}

export const TaskDialog = ({ open, onClose, formData, setFormData, onSubmit, isLoading, t, errors }: Props) => {

    const quillModules = {
        toolbar: [
            [{'header': [1, 2, 3, false]}],
            ['bold', 'italic', 'underline', 'strike'],
            [{'list': 'ordered'}, {'list': 'bullet'}],
            ['link', 'clean']
        ],
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}>
            <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
                {t("round_details.tasks.create_title", "Створити завдання")}
            </DialogTitle>
            <DialogContent>
                <Stack spacing={2.5} sx={{ mt: 1 }}>
                    <ErrorMessages errors={errors} />

                    <TextField label={t("round_details.tasks.form.title")} fullWidth value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} variant="outlined" />

                    <Box sx={{ '& .ql-container': { borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px', minHeight: '150px' }, '& .ql-toolbar': { borderTopLeftRadius: '8px', borderTopRightRadius: '8px' } }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', ml: 1, display: 'block', mb: 0.5 }}>{t("round_details.tasks.form.description")}</Typography>
                        <ReactQuill theme="snow" value={formData.description || ""} modules={quillModules} onChange={(val: string) => setFormData(prev => ({ ...prev, description: val }))} />
                    </Box>

                    <Stack direction="row" spacing={2}>
                        <TextField select label={t("round_details.tasks.form.type")} fullWidth value={formData.type} onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}>
                            {TASK_TYPES.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                        </TextField>

                        <TextField select label={t("round_details.tasks.form.priority")} fullWidth value={formData.priority} onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}>
                            {TASK_PRIORITIES.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                        </TextField>
                    </Stack>

                    <TextField select label={t("round_details.tasks.form.status")} fullWidth value={formData.status} onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}>
                        {TASK_STATUSES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </TextField>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} disabled={isLoading} sx={{ textTransform: 'none', fontWeight: 600 }}>{t("common.cancel")}</Button>
                <Button variant="contained" onClick={onSubmit} disabled={isLoading} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px', px: 3 }}>
                    {isLoading ? t("common.saving") : t("common.save")}
                </Button>
            </DialogActions>
        </Dialog>
    );
};