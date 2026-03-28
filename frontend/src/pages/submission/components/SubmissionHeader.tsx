import {Avatar, Box, IconButton, Tooltip, Typography} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

interface Props {
    isLocked: boolean;
    isEditMode: boolean;
    actionLoading: boolean;
    onDelete: () => void;
    t: any;
}

export const SubmissionHeader = ({ isLocked, isEditMode, actionLoading, onDelete, t }: Props) => (
    <Box sx={{ mb: 4, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar sx={{
                bgcolor: isLocked ? "grey.400" : (isEditMode ? "success.light" : "primary.light"),
                color: "white", width: 56, height: 56
            }}>
                {isLocked ? <LockIcon /> : <CloudUploadIcon />}
            </Avatar>
            <Box>
                <Typography variant="h4" fontWeight={800} color={isLocked ? "text.secondary" : "text.primary"}>
                    {isEditMode ? t('submission.title_update') : t('submission.title_create')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {isLocked
                        ? t('submission.status.locked_description')
                        : (isEditMode ? t('submission.subtitle_update') : t('submission.subtitle_create'))
                    }
                </Typography>
            </Box>
        </Box>

        {isEditMode && !isLocked && (
            <Tooltip title={t('submission.actions.delete')}>
                <IconButton color="error" onClick={onDelete} disabled={actionLoading}>
                    <DeleteOutlineIcon />
                </IconButton>
            </Tooltip>
        )}
    </Box>
);