import {useCallback, useState} from "react";
import {teamTaskService} from "../../../../../services/impl/TeamTaskService";
import type {
    TaskPriority,
    TaskStatus,
    TaskType,
    TeamTaskRequestDto
} from "../../../../../entities/teamTask/teamTask.dto.ts";

export const useRoundTasksManager = ({
                                         roundId,
                                         tasksPage,
                                         fetchTasks,
                                         clearErrors,
                                         handleError,
                                         triggerConfirm,
                                         closeConfirm,
    t
                                     }: any) => {

    const [taskModalOpen, setTaskModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [isTaskLoading, setIsTaskLoading] = useState(false);

    const [taskFormData, setTaskFormData] = useState<TeamTaskRequestDto>({
        title: "",
        description: "",
        status: "TODO",
        type: "FEATURE",
        priority: "MEDIUM"
    });

    const handleSaveTask = useCallback(async () => {
        clearErrors();
        setIsTaskLoading(true);

        try {
            if (selectedTask) {
                await teamTaskService.updateTask(selectedTask.id, taskFormData);
            } else {
                await teamTaskService.createTask(roundId, taskFormData);
            }

            setTaskModalOpen(false);
            await fetchTasks(tasksPage, true);
        } catch (e) {
            handleError(e, "Помилка збереження завдання");
        } finally {
            setIsTaskLoading(false);
        }
    }, [selectedTask, taskFormData]);

    const handleDeleteTask = useCallback((taskId: number) => {
        triggerConfirm({
            title: t("round_details.deleteTask.title"),
            description: t("round_details.deleteTask.description"),
            confirmColor: "error",
            onConfirm: async () => {
                try {
                    await teamTaskService.deleteTask(taskId);
                    await fetchTasks(tasksPage, true);
                    closeConfirm();
                } catch (e) {
                    handleError(e, "Помилка видалення завдання");
                }
            }
        });
    }, []);

    const handleUpdateTaskMeta = useCallback(async (taskId: number, meta: { status?: TaskStatus; priority?: TaskPriority; type?: TaskType }) => {
        try {
            await teamTaskService.updateTaskMeta(taskId, meta);
            await fetchTasks(tasksPage, false);
        } catch (error: any) {
            handleError(error, "Помилка оновлення статусу");
        }
    }, [fetchTasks, tasksPage, handleError]);

    const handleUpdateTaskText = async (id: number, title: string, description: string) => {
        try {
            await teamTaskService.updateTask(id, { title, description } as any);
            await fetchTasks(tasksPage, true);
        } catch (error: any) {
            handleError(error, "Помилка оновлення завдання");
        }
    };

    const handleAssignTeammate = useCallback(async (taskId: number, userId: number) => {
        try {
            await teamTaskService.updateAssignee(taskId, userId);
            await fetchTasks(tasksPage, true);
        } catch (error: any) {
            handleError(error, "Помилка призначення виконавця");
        }
    }, [fetchTasks, tasksPage, handleError]);


    return {
        taskModalOpen,
        setTaskModalOpen,
        selectedTask,
        setSelectedTask,
        taskFormData,
        setTaskFormData,
        isTaskLoading,
        handleSaveTask,
        handleDeleteTask,
        handleUpdateTaskMeta,
        handleUpdateTaskText,
        handleAssignTeammate
    };
};