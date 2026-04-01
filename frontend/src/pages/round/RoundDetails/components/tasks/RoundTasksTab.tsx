import {type MouseEvent, useState} from "react";
import {
    Avatar,
    Box,
    Button,
    Chip,
    CircularProgress,
    Collapse,
    IconButton,
    Menu,
    MenuItem,
    Stack,
    TextField,
    Tooltip,
    Typography
} from "@mui/material";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import AddIcon from '@mui/icons-material/Add';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import CheckIcon from '@mui/icons-material/Check'; // ДОДАНО
import CloseIcon from '@mui/icons-material/Close'; // ДОДАНО
import Cookies from "js-cookie";
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import ReactQuill from "react-quill-new"; // ДОДАНО
import "react-quill-new/dist/quill.snow.css"; // ДОДАНО
import type {
    TaskPriority,
    TaskStatus,
    TaskType,
    TeamTaskResponseDto
} from "../../../../../entities/teamTask/teamtask.dto";
import {TASK_PRIORITIES, TASK_STATUSES, TASK_TYPES} from "../../../../../entities/teamTask/teamtask.dto";
import type {UserResponseDto} from "../../../../../entities/user/user.dto.ts";

interface Props {
    tasks: TeamTaskResponseDto[];
    loadingTab: boolean;
    onOpenTaskModal: () => void; // Змінено: тепер модалка тільки для створення (без аргументів)
    onDeleteTask: (id: number) => void;
    onUpdateMeta: (id: number, meta: { status?: TaskStatus; priority?: TaskPriority; type?: TaskType }) => void;

    // НОВИЙ ПРОП для збереження тексту та опису
    onUpdateTaskText: (id: number, title: string, description: string) => void;

    myTeamUsers: UserResponseDto[];
    onAssignTeammate: (taskId: number, userId: number) => void;

    t: any;
}

const getPriorityStyles = (p: TaskPriority) => {
    if (p === 'HIGH') return { bgcolor: '#FFCCD1', color: '#D32F2F', fontWeight: 700 };
    if (p === 'MEDIUM') return { bgcolor: '#FFF2CC', color: '#D69E2E', fontWeight: 700 };
    return { bgcolor: '#E2FDCB', color: '#388E3C', fontWeight: 700 };
};

const quillModules = {
    toolbar: [
        [{'header': [1, 2, 3, false]}],
        ['bold', 'italic', 'underline', 'strike'],
        [{'list': 'ordered'}, {'list': 'bullet'}],
        ['link', 'clean']
    ],
};

export const RoundTasksTab = ({ tasks, loadingTab, onOpenTaskModal, onDeleteTask, onUpdateMeta, onUpdateTaskText, myTeamUsers, onAssignTeammate, t }: Props) => {
    const currentUserId = Number(Cookies.get("userId"));

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [activeMenu, setActiveMenu] = useState<{ id: number; field: 'status' | 'priority' | 'type' } | null>(null);

    const [userAnchorEl, setUserAnchorEl] = useState<null | HTMLElement>(null);
    const [activeUserTaskId, setActiveUserTaskId] = useState<number | null>(null);

    const [expandedTasks, setExpandedTasks] = useState<number[]>([]);

    // СТАН ДЛЯ INLINE РЕДАГУВАННЯ
    const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
    const [editDraft, setEditDraft] = useState({ title: '', description: '' });

    const toggleExpand = (id: number) => {
        setExpandedTasks(prev => prev.includes(id) ? prev.filter(taskId => taskId !== id) : [...prev, id]);
    };

    const handleOpenMenu = (event: MouseEvent<HTMLElement>, id: number, field: 'status' | 'priority' | 'type') => {
        setAnchorEl(event.currentTarget);
        setActiveMenu({ id, field });
    };

    const handleCloseMenu = () => { setAnchorEl(null); setActiveMenu(null); };

    const handleSelectOption = (value: string) => {
        if (activeMenu) onUpdateMeta(activeMenu.id, { [activeMenu.field]: value });
        handleCloseMenu();
    };

    const handleOpenUserMenu = (event: MouseEvent<HTMLElement>, taskId: number) => {
        setUserAnchorEl(event.currentTarget);
        setActiveUserTaskId(taskId);
    };

    const handleCloseUserMenu = () => { setUserAnchorEl(null); setActiveUserTaskId(null); };

    const handleSelectUser = (userId: number) => {
        if (activeUserTaskId) onAssignTeammate(activeUserTaskId, userId);
        handleCloseUserMenu();
    };

    // ХЕНДЛЕРИ РЕДАГУВАННЯ
    const handleStartEdit = (task: TeamTaskResponseDto) => {
        setEditingTaskId(task.id);
        setEditDraft({ title: task.title, description: task.description || '' });
        // Автоматично розгортаємо таску, щоб було видно опис для редагування
        if (!expandedTasks.includes(task.id)) {
            setExpandedTasks(prev => [...prev, task.id]);
        }
    };

    const handleSaveEdit = (id: number) => {
        onUpdateTaskText(id, editDraft.title, editDraft.description);
        setEditingTaskId(null);
    };

    if (loadingTab) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;

    return (
        <Box sx={{ maxWidth: '1000px', mx: 'auto', mt: 2 }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{t("round_details.tasks.title")}</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => onOpenTaskModal()} sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}>
                    {t("round_details.tasks.add_btn")}
                </Button>
            </Box>

            <Stack spacing={1.5}>
                {tasks.length === 0 ? (
                    <Typography sx={{ py: 6, textAlign: 'center', color: 'text.secondary', bgcolor: 'grey.50', borderRadius: '12px' }}>
                        {t("round_details.tasks.empty")}
                    </Typography>
                ) : (
                    tasks.map((task) => {
                        const isAssignedToMe = task.assignee?.id === currentUserId;
                        const isExpanded = expandedTasks.includes(task.id);
                        const isEditing = editingTaskId === task.id;

                        return (
                            <Box key={task.id} sx={{ display: 'flex', flexDirection: 'column', p: 2, bgcolor: isEditing ? '#f8f9fa' : '#ffffff', border: '1px solid', borderColor: isEditing ? 'primary.main' : 'divider', borderRadius: '16px', transition: 'all 0.2s ease', '&:hover': { borderColor: 'primary.main', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' } }}>
                                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', gap: 2 }}>

                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <IconButton size="small" onClick={() => toggleExpand(task.id)} sx={{ color: 'primary.main' }}>
                                                {isExpanded ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
                                            </IconButton>

                                            {/* ПОЛЕ ВВОДУ АБО ЗВИЧАЙНИЙ ТЕКСТ ДЛЯ ЗАГОЛОВКА */}
                                            {isEditing ? (
                                                <TextField
                                                    size="small"
                                                    fullWidth
                                                    autoFocus
                                                    value={editDraft.title}
                                                    onChange={(e) => setEditDraft(prev => ({ ...prev, title: e.target.value }))}
                                                    sx={{ bgcolor: 'white' }}
                                                />
                                            ) : (
                                                <Typography variant="subtitle1" onClick={() => toggleExpand(task.id)} sx={{ fontWeight: 700, color: 'text.primary', cursor: 'pointer', '&:hover': { color: 'primary.main' } }}>
                                                    {task.title}
                                                </Typography>
                                            )}
                                        </Stack>

                                        {!isEditing && (
                                            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.2, ml: 4, opacity: 0.8 }}>
                                                <HistoryEduIcon sx={{ fontSize: '0.85rem', color: 'text.disabled' }} />
                                                <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 500 }}>
                                                    {t("round_details.tasks.by", "від")} {task.creator?.fullName || "System"}
                                                </Typography>
                                            </Stack>
                                        )}
                                    </Box>

                                    <Stack direction="row" spacing={1.2} alignItems="center" sx={{ flexShrink: 0 }}>
                                        {task.assignee ? (
                                            <Tooltip title={`${t("round_details.tasks.assigned_to")}: ${task.assignee.fullName}. Клікніть, щоб змінити.`}>
                                                <Avatar onClick={(e) => handleOpenUserMenu(e, task.id)} sx={{ width: 32, height: 32, fontSize: '0.875rem', cursor: 'pointer', bgcolor: isAssignedToMe ? 'primary.main' : 'grey.400', border: isAssignedToMe ? '2px solid #2E7D32' : 'none', '&:hover': { filter: 'brightness(0.9)' } }}>
                                                    {task.assignee.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                </Avatar>
                                            </Tooltip>
                                        ) : (
                                            <Tooltip title={t("round_details.tasks.assign_user", "Призначити виконавця")}>
                                                <IconButton size="small" onClick={(e) => handleOpenUserMenu(e, task.id)} sx={{ border: '1px dashed', borderColor: 'divider' }}>
                                                    <PersonAddAltIcon fontSize="small" color="action" />
                                                </IconButton>
                                            </Tooltip>
                                        )}

                                        <Chip label={task.type} size="small" variant="outlined" onClick={(e) => handleOpenMenu(e, task.id, 'type')} onDelete={(e) => handleOpenMenu(e, task.id, 'type')} deleteIcon={<KeyboardArrowDownIcon sx={{ fontSize: '1rem !important' }} />} sx={{ borderRadius: '6px', fontWeight: 600, color: 'text.secondary', cursor: 'pointer' }} />
                                        <Chip label={task.priority} size="small" onClick={(e) => handleOpenMenu(e, task.id, 'priority')} onDelete={(e) => handleOpenMenu(e, task.id, 'priority')} deleteIcon={<KeyboardArrowDownIcon sx={{ fontSize: '1rem !important', color: 'inherit !important' }} />} sx={{ borderRadius: '6px', cursor: 'pointer', ...getPriorityStyles(task.priority) }} />
                                        <Chip label={task.status} size="small" color={task.status === 'DONE' ? 'success' : task.status === 'IN_PROGRESS' ? 'primary' : 'default'} onClick={(e) => handleOpenMenu(e, task.id, 'status')} onDelete={(e) => handleOpenMenu(e, task.id, 'status')} deleteIcon={<KeyboardArrowDownIcon sx={{ fontSize: '1rem !important', color: 'inherit !important' }} />} sx={{ borderRadius: '6px', fontWeight: 700, cursor: 'pointer', minWidth: '95px', '&:hover': { filter: 'brightness(0.9)' } }} />
                                    </Stack>

                                    {/* КНОПКИ ЗБЕРЕЖЕННЯ АБО РЕДАГУВАННЯ */}
                                    <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0, ml: { md: 2 } }}>
                                        {isEditing ? (
                                            <>
                                                <IconButton size="small" onClick={() => handleSaveEdit(task.id)} sx={{ color: 'success.main', bgcolor: '#E8F5E9', '&:hover': { bgcolor: '#C8E6C9' } }}><CheckIcon fontSize="small" /></IconButton>
                                                <IconButton size="small" onClick={() => setEditingTaskId(null)} sx={{ color: 'error.main', bgcolor: '#FFEBEE', '&:hover': { bgcolor: '#FFCDD2' } }}><CloseIcon fontSize="small" /></IconButton>
                                            </>
                                        ) : (
                                            <>
                                                <IconButton size="small" onClick={() => handleStartEdit(task)} sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: 'primary.light' } }}><EditOutlinedIcon fontSize="small" /></IconButton>
                                                <IconButton size="small" onClick={() => onDeleteTask(task.id)} sx={{ color: 'text.secondary', '&:hover': { color: 'error.main', bgcolor: '#FFEBEE' } }}><DeleteOutlineIcon fontSize="small" /></IconButton>
                                            </>
                                        )}
                                    </Stack>
                                </Box>

                                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                    <Box sx={{ mt: 2, ml: 4, p: 2, bgcolor: isEditing ? '#ffffff' : 'grey.50', borderRadius: '8px', border: '1px solid', borderColor: isEditing ? 'primary.main' : 'divider' }}>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1, fontWeight: 600 }}>
                                            {t("round_details.tasks.form.description", "Опис")}:
                                        </Typography>

                                        {/* QUILL ДЛЯ РЕДАГУВАННЯ АБО ЗВИЧАЙНИЙ HTML */}
                                        {isEditing ? (
                                            <ReactQuill
                                                theme="snow"
                                                value={editDraft.description}
                                                modules={quillModules}
                                                onChange={(val: string) => setEditDraft(prev => ({ ...prev, description: val }))}
                                            />
                                        ) : (
                                            <Box className="ql-editor" sx={{ fontSize: '0.875rem', color: 'text.primary', p: 0, minHeight: 'auto', '& p': { mb: 1 } }} dangerouslySetInnerHTML={{ __html: task.description || "<i>Немає опису</i>" }} />
                                        )}
                                    </Box>
                                </Collapse>
                            </Box>
                        )
                    })
                )}
            </Stack>

            {/* МЕНЮ ДЛЯ STATUS/PRIORITY/TYPE (без змін) */}
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu} PaperProps={{ elevation: 0, sx: { mt: 0.5, borderRadius: '10px', border: '1px solid', borderColor: 'divider', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', minWidth: '120px' } }} transformOrigin={{ horizontal: 'right', vertical: 'top' }} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
                {activeMenu?.field === 'status' && TASK_STATUSES.map((status) => (<MenuItem key={status} onClick={() => handleSelectOption(status)} sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{status}</MenuItem>))}
                {activeMenu?.field === 'priority' && TASK_PRIORITIES.map((priority) => (<MenuItem key={priority} onClick={() => handleSelectOption(priority)} sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{priority}</MenuItem>))}
                {activeMenu?.field === 'type' && TASK_TYPES.map((type) => (<MenuItem key={type} onClick={() => handleSelectOption(type)} sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{type}</MenuItem>))}
            </Menu>

            {/* МЕНЮ ДЛЯ ВИБОРУ ВИКОНАВЦЯ (без змін) */}
            <Menu anchorEl={userAnchorEl} open={Boolean(userAnchorEl)} onClose={handleCloseUserMenu} PaperProps={{ elevation: 0, sx: { mt: 0.5, borderRadius: '10px', border: '1px solid', borderColor: 'divider', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', minWidth: '200px' } }} transformOrigin={{ horizontal: 'right', vertical: 'top' }} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
                {myTeamUsers.length === 0 ? (
                    <Typography sx={{ p: 2, fontSize: '0.875rem', color: 'text.secondary' }}>Немає доступних учасників</Typography>
                ) : (
                    myTeamUsers.map((user) => (
                        <MenuItem key={user.id} onClick={() => handleSelectUser(user.id)} sx={{ py: 1, px: 1.5, borderRadius: '8px', mx: 0.5 }}>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                                <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>{user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}</Avatar>
                                <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{user.fullName}</Typography>
                            </Stack>
                        </MenuItem>
                    ))
                )}
            </Menu>
        </Box>
    );
};