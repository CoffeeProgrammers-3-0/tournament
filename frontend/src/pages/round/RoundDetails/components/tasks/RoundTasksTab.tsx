import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Grid,
    IconButton,
    Stack,
    Typography
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import type {TaskPriority, TaskStatus, TeamTaskResponseDto} from "../../../../../entities/teamTask/teamtask.dto";

interface Props {
    tasks: TeamTaskResponseDto[];
    loadingTab: boolean;
    onOpenTaskModal: (task?: TeamTaskResponseDto) => void;
    onDeleteTask: (id: number) => void;
    onUpdateMeta: (id: number, meta: { status: TaskStatus }) => void;
    t: any;
}

const getPriorityColor = (p: TaskPriority) => {
    if (p === 'HIGH') return 'error';
    if (p === 'MEDIUM') return 'warning';
    return 'success';
};

export const RoundTasksTab = ({ tasks, loadingTab, onOpenTaskModal, onDeleteTask, onUpdateMeta, t }: Props) => {

    if (loadingTab) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">{t("round_details.tasks.title")}</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => onOpenTaskModal()}>
                    {t("round_details.tasks.add_btn")}
                </Button>
            </Box>

            <Grid container spacing={2}>
                {tasks.length === 0 ? (
                    <Grid size={{xs:12}}>
                        <Typography sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
                            {t("round_details.tasks.empty")}
                        </Typography>
                    </Grid>
                ) : (
                    tasks.map((task) => (
                        <Grid size={{xs:12, md:6}} key={task.id}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                        <Box>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{task.title}</Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                {task.description}
                                            </Typography>
                                            <Stack direction="row" spacing={1}>
                                                <Chip label={task.type} size="small" variant="outlined" />
                                                <Chip label={task.priority} size="small" color={getPriorityColor(task.priority)} />
                                                <Chip
                                                    label={task.status}
                                                    size="small"
                                                    color={task.status === 'DONE' ? 'success' : 'default'}
                                                    onClick={() => {
                                                        const nextStatus: TaskStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
                                                        onUpdateMeta(task.id, { status: nextStatus });
                                                    }}
                                                />
                                            </Stack>
                                        </Box>
                                        <Box>
                                            <IconButton size="small" onClick={() => onOpenTaskModal(task)}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" color="error" onClick={() => onDeleteTask(task.id)}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </Stack>
                                    {task.assignee && (
                                        <Typography variant="caption" sx={{ mt: 1, display: 'block', fontStyle: 'italic' }}>
                                            {t("round_details.tasks.assigned_to")}: {task.assignee.fullName}
                                        </Typography>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                )}
            </Grid>
        </Box>
    );
};