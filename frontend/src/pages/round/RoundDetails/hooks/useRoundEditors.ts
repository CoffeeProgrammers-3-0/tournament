import type {RoundFullResponseDto,} from "../../../../entities/round/round.dto";
import type {TeamLeaderboardResponseDto,} from "../../../../entities/team/team.dto";
import {useRoundAnnouncements} from "../components/events/useRoundAnnouncements.ts";
import {useRoundEditorsCore} from "./useRoundEditorsCore.ts";
import {useRoundInfoEditor} from "../components/info/useRoundInfoEditor.ts";
import {useRoundTasksManager} from "../components/tasks/useRoundTasksManager.ts";
import {useRoundJuryManager} from "../components/juries/useRoundJuryManager.ts";
import {useRoundCategoriesManager} from "../components/criterias/useRoundCategoriesManager.ts";
import {useRoundTeamsManager} from "../components/teams/useRoundTeamsManager.ts";

type Params = {
    id?: string;
    roundData: RoundFullResponseDto | null;
    setRoundData: React.Dispatch<React.SetStateAction<RoundFullResponseDto | null>>;
    fetchRound: () => Promise<void>;
    fetchCategories: () => Promise<void>;
    fetchJury: () => Promise<void>;
    fetchSubmissions: () => Promise<void>;
    fetchTasks: (page?: number, showLoader?: boolean) => Promise<void>;
    tasksPage: number;
    leaderboard: TeamLeaderboardResponseDto[];
    fetchEvents: (page: number) => Promise<void>; 
    fetchMessages: (page: number) => Promise<void>; 
    isAdmin: boolean;
    t: any;
    myTeamId: number | string;
};

export type ConfirmDialogConfig = {
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void | Promise<void>;
    confirmColor?: "primary" | "error" | "secondary";
    isLoading?: boolean;
};

export const useRoundEditors = (params: Params) => {
    const base = useRoundEditorsCore();

    const info = useRoundInfoEditor({
        roundData: params.roundData,
        roundId: Number(params.id),
        setRoundData: params.setRoundData,
        fetchRound: params.fetchRound,
        t: params.t,
        ...base,
    });

    const jury = useRoundJuryManager({
        roundId: Number(params.id),
        fetchJury: params.fetchJury,
        fetchSubmissions: params.fetchSubmissions,
        t: params.t,
        ...base,
    });

    const categories = useRoundCategoriesManager({
        roundId: Number(params.id),
        fetchCategories: params.fetchCategories,
        t: params.t,
        ...base,
    });

    const teams = useRoundTeamsManager({
        roundId: Number(params.id),
        leaderboard: params.leaderboard,
        fetchSubmissions: params.fetchSubmissions,
        t: params.t,
        isAdmin: params.isAdmin,
        myTeamId: params.myTeamId,
        ...base,
    });

    const tasks = useRoundTasksManager({
        roundId: Number(params.id),
        tasksPage: params.tasksPage,
        fetchTasks: params.fetchTasks,
        t: params.t,
        ...base,
    });

    const announcements = useRoundAnnouncements(
        Number(params.id),
        params.fetchEvents,
        params.fetchMessages,
        params.t,
        base
    );

    return {
        ...base,
        ...info,
        ...jury,
        ...categories,
        ...teams,
        ...tasks,
        announcements,
    };
};