import {type MouseEvent, useState} from "react";
import {
    Avatar,
    Box,
    Button,
    Chip,
    CircularProgress,
    IconButton,
    Menu,
    MenuItem,
    Stack,
    Tooltip,
    Typography
} from "@mui/material";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import AddIcon from '@mui/icons-material/Add';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Cookies from "js-cookie";

import type {
    TaskPriority,
    TaskStatus,
    TaskType,
    TeamTaskResponseDto
} from "../../../../../entities/teamTask/teamtask.dto";
import {TASK_PRIORITIES, TASK_STATUSES, TASK_TYPES} from "../../../../../entities/teamTask/teamtask.dto";

interface Props {
    tasks: TeamTaskResponseDto[];
    loadingTab: boolean;
    onOpenTaskModal: (task?: TeamTaskResponseDto) => void;
    onDeleteTask: (id: number) => void;
    onUpdateMeta: (id: number, meta: { status?: TaskStatus; priority?: TaskPriority; type?: TaskType }) => void;
    onAssignMe: (taskId: number, userId: number) => void;
    t: any;
}

const getPriorityStyles = (p: TaskPriority) => {
    if (p === 'HIGH') return { bgcolor: '#FFCCD1', color: '#D32F2F', fontWeight: 700 };
    if (p === 'MEDIUM') return { bgcolor: '#FFF2CC', color: '#D69E2E', fontWeight: 700 };
    return { bgcolor: '#E2FDCB', color: '#388E3C', fontWeight: 700 };
};

export const RoundTasksTab = ({ tasks, loadingTab, onOpenTaskModal, onDeleteTask, onUpdateMeta, onAssignMe, t }: Props) => {
    const currentUserId = Number(Cookies.get("userId"));

    // Стейт для керування меню
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [activeMenu, setActiveMenu] = useState<{ id: number; field: 'status' | 'priority' | 'type' } | null>(null);

    const handleOpenMenu = (event: MouseEvent<HTMLElement>, id: number, field: 'status' | 'priority' | 'type') => {
        setAnchorEl(event.currentTarget);
        setActiveMenu({ id, field });
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
        setActiveMenu(null);
    };

    const handleSelectOption = (value: string) => {
        if (activeMenu) {
            onUpdateMeta(activeMenu.id, { [activeMenu.field]: value });
        }
        handleCloseMenu();
    };

    if (loadingTab) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;

    return (
        <Box sx={{ maxWidth: '1000px', mx: 'auto', mt: 2 }}>
            {/* Header */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{t("round_details.tasks.title")}</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => onOpenTaskModal()}
                    sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
                >
                    {t("round_details.tasks.add_btn")}
                </Button>
            </Box>

            {/* Tasks List */}
            <Stack spacing={1.5}>
                {tasks.length === 0 ? (
                    <Typography sx={{ py: 6, textAlign: 'center', color: 'text.secondary', bgcolor: 'grey.50', borderRadius: '12px' }}>
                        {t("round_details.tasks.empty")}
                    </Typography>
                ) : (
                    tasks.map((task) => {
                        const isAssignedToMe = task.assignee?.id === currentUserId;

                        return (
                            <Box
                                key={task.id}
                                sx={{
                                    display: 'flex',
                                    flexDirection: { xs: 'column', md: 'row' },
                                    alignItems: { xs: 'flex-start', md: 'center' },
                                    justifyContent: 'space-between',
                                    p: 2,
                                    bgcolor: '#ffffff',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: '16px',
                                    gap: 2,
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        borderColor: 'primary.main',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                        transform: 'translateY(-1px)'
                                    }
                                }}
                            >
                                {/* Left Side: Title & Description */}
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5, color: 'text.primary' }}>
                                        {task.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }}>
                                        {task.description}
                                    </Typography>
                                </Box>

                                {/* Center Side: Quick Edit Dropdowns */}
                                <Stack direction="row" spacing={1.2} alignItems="center" sx={{ flexShrink: 0 }}>

                                    {/* Аватарка / Призначення */}
                                    {task.assignee ? (
                                        <Tooltip title={`${t("round_details.tasks.assigned_to")}: ${task.assignee.fullName}`}>
                                            <Avatar
                                                sx={{
                                                    width: 32,
                                                    height: 32,
                                                    fontSize: '0.875rem',
                                                    bgcolor: isAssignedToMe ? 'primary.main' : 'grey.400',
                                                    border: isAssignedToMe ? '2px solid #2E7D32' : 'none'
                                                }}
                                            >
                                                {task.assignee.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                            </Avatar>
                                        </Tooltip>
                                    ) : (
                                        <Tooltip title={t("round_details.tasks.assign_me", "Призначити себе")}>
                                            <IconButton
                                                size="small"
                                                onClick={() => onAssignMe(task.id, currentUserId)}
                                                sx={{ border: '1px dashed', borderColor: 'divider' }}
                                            >
                                                <PersonAddAltIcon fontSize="small" color="action" />
                                            </IconButton>
                                        </Tooltip>
                                    )}

                                    {/* Type Dropdown */}
                                    <Chip
                                        label={task.type}
                                        size="small"
                                        variant="outlined"
                                        onClick={(e) => handleOpenMenu(e, task.id, 'type')}
                                        onDelete={(e) => handleOpenMenu(e, task.id, 'type')}
                                        deleteIcon={<KeyboardArrowDownIcon sx={{ fontSize: '1rem !important' }} />}
                                        sx={{ borderRadius: '6px', fontWeight: 600, color: 'text.secondary', cursor: 'pointer' }}
                                    />

                                    {/* Priority Dropdown */}
                                    <Chip
                                        label={task.priority}
                                        size="small"
                                        onClick={(e) => handleOpenMenu(e, task.id, 'priority')}
                                        onDelete={(e) => handleOpenMenu(e, task.id, 'priority')}
                                        deleteIcon={<KeyboardArrowDownIcon sx={{ fontSize: '1rem !important', color: 'inherit !important' }} />}
                                        sx={{ borderRadius: '6px', cursor: 'pointer', ...getPriorityStyles(task.priority) }}
                                    />

                                    {/* Status Dropdown */}
                                    <Chip
                                        label={task.status}
                                        size="small"
                                        color={task.status === 'DONE' ? 'success' : task.status === 'IN_PROGRESS' ? 'primary' : 'default'}
                                        onClick={(e) => handleOpenMenu(e, task.id, 'status')}
                                        onDelete={(e) => handleOpenMenu(e, task.id, 'status')}
                                        deleteIcon={<KeyboardArrowDownIcon sx={{ fontSize: '1rem !important', color: 'inherit !important' }} />}
                                        sx={{
                                            borderRadius: '6px',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            minWidth: '95px',
                                            '&:hover': { filter: 'brightness(0.9)' }
                                        }}
                                    />
                                </Stack>

                                {/* Right Side: Actions */}
                                <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0, ml: { md: 2 } }}>
                                    <IconButton
                                        size="small"
                                        onClick={() => onOpenTaskModal(task)}
                                        sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: 'primary.light' } }}
                                    >
                                        <EditOutlinedIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => onDeleteTask(task.id)}
                                        sx={{ color: 'text.secondary', '&:hover': { color: 'error.main', bgcolor: '#FFEBEE' } }}
                                    >
                                        <DeleteOutlineIcon fontSize="small" />
                                    </IconButton>
                                </Stack>
                            </Box>
                        )
                    })
                )}
            </Stack>

            {/* ОДИНАМІЧНЕ МЕНЮ ДЛЯ ВСІХ ТАБІВ */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        mt: 0.5,
                        borderRadius: '10px',
                        border: '1px solid',
                        borderColor: 'divider',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        minWidth: '120px'
                    }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                {activeMenu?.field === 'status' &&
                    TASK_STATUSES.map((status) => (
                        <MenuItem key={status} onClick={() => handleSelectOption(status)} sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                            {status}
                        </MenuItem>
                    ))}
                {activeMenu?.field === 'priority' &&
                    TASK_PRIORITIES.map((priority) => (
                        <MenuItem key={priority} onClick={() => handleSelectOption(priority)} sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                            {priority}
                        </MenuItem>
                    ))}
                {activeMenu?.field === 'type' &&
                    TASK_TYPES.map((type) => (
                        <MenuItem key={type} onClick={() => handleSelectOption(type)} sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                            {type}
                        </MenuItem>
                    ))}
            </Menu>
        </Box>
    );
};