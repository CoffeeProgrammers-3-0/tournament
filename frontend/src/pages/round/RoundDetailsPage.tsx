import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Tab,
    Tabs,
    TextField,
    Typography
} from "@mui/material";
import {useTranslation} from "react-i18next";
import Cookies from "js-cookie";
import {useNavigate, useParams} from "react-router-dom";
import {useEffect} from "react";

import {useRoundDetails} from "./RoundDetails/hooks/useRoundDetails";
import {useRoundEditors} from "./RoundDetails/hooks/useRoundEditors";
import {RoundHeader} from "./RoundDetails/components/info/RoundHeader";
import {RoundInfoTab} from "./RoundDetails/components/info/RoundInfoTab";
import {RoundCategoriesTab} from './RoundDetails/components/criterias/RoundCategoriesTab';
import {RoundJuryTab} from "./RoundDetails/components/juries/RoundJuryTab";
import {RoundTeamsTab} from "./RoundDetails/components/teams/RoundTeamsTab";
import {RoundStatsDialog} from "./RoundDetails/components/teams/RoundStatsDialog";
import {CategoryDialog} from "./RoundDetails/components/criterias/CategoryDialog";
import {JuryDialog} from "./RoundDetails/components/juries/JuryDialog";
import {CriteriaDialog} from "./RoundDetails/components/criterias/CriteriaDialog";
import {RoundSubmissionsTab} from "./RoundDetails/components/submissions/RoundSubmissionsTab";
import {AddMissingTeamsModal, AdvanceTeamsModal} from "./RoundDetails/components/teams/TeamsModal";
import {UniversalConfirmDialog} from "./RoundDetails/components/UniversalConfirmDialog.tsx";
import {ErrorMessages} from "../../components/main/ErrorMessages.tsx";
import {TaskDialog} from "./RoundDetails/components/tasks/TaskDialog.tsx";
import {RoundTasksTab} from "./RoundDetails/components/tasks/RoundTasksTab.tsx";

import {RoundAnnouncementsTab} from "./RoundDetails/components/events/RoundAnnouncementsTab.tsx";
import {CreateEventDialog, CreateMessageDialog} from "./RoundDetails/components/events/AnnouncementDialogs.tsx";
import {toLocalInput} from "../../utils/data.ts";

const RoundDetailsPage = () => {
    const {t} = useTranslation();
    const isAdmin = Cookies.get("role") === "ADMIN";
    const isUser = Cookies.get("role") === "USER";
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();

    if (!id || isNaN(Number(id)) || Number(id) < 1) {
        window.location.replace('/404');
        return null; // Повертаємо null, щоб React не сварився під час редіректу
    }

    const details = useRoundDetails(id);
    const editors = useRoundEditors({
        id: id,
        roundData: details.roundData,
        setRoundData: details.setRoundData,
        fetchRound: details.fetchRound,
        fetchCategories: details.fetchCategories,
        fetchJury: details.fetchJury,
        fetchSubmissions: details.fetchSubmissions,
        fetchTasks: details.fetchTasks,
        tasksPage: details.tasksPage,
        leaderboard: details.leaderboard,
        fetchEvents: details.fetchEvents,
        fetchMessages: details.fetchMessages,
        isAdmin: isAdmin,
        t: t
    });

    const TABS = [
        {id: "info", label: t("round_details.tabs.info"), show: true},
        // НОВА ВКЛАДКА ДОСТУПНА ВСІМ
        {id: "announcements", label: t("round_details.tabs.announcements", "Оголошення"), show: true},
        {id: "categories", label: t("round_details.tabs.categories"), show: true},
        {id: "jury", label: t("round_details.tabs.jury"), show: true},
        {
            id: "leaderboard",
            label: t("round_details.tabs.leaderboard"),
            show: isAdmin || details.roundData?.status === "EVALUATED" || details.roundData?.status === "SUBMISSION_CLOSED"
        },
        {id: "submissions", label: t("round_details.tabs.submissions"), show: isAdmin},
        {id: "tasks", label: t("round_details.tabs.tasks"), show: isUser},
    ].filter(tab => tab.show);

    const activeTabId = TABS[details.tabValue]?.id;

    useEffect(() => {
        if (!activeTabId) return;

        switch (activeTabId) {
            case "announcements": // Завантажуємо оголошення при відкритті вкладки
                details.fetchEvents();
                details.fetchMessages();
                break;
            case "categories":
                details.fetchCategories();
                break;
            case "jury":
                details.fetchJury();
                break;
            case "leaderboard":
                details.loadLeaderboard(true);
                break;
            case "submissions":
                details.fetchSubmissions(0);
                break;
            case "tasks":
                details.fetchTasks(0);
                details.fetchAllMyTeammates();
                break;
            default:
                break;
        }
    }, [activeTabId]);

    if (details.loading) return <Box sx={{display: "flex", justifyContent: "center", mt: 10}}><CircularProgress/></Box>;
    if (!details.roundData) return <Typography
        sx={{textAlign: "center", mt: 5}}>{t("round_details.not_found")}</Typography>;

    return (
        <Box sx={{ pb: 8, pt: 1 }}>
            {/* Connected to the newly optimized RoundHeader */}
            <RoundHeader
                roundData={details.roundData}
                isAdmin={isAdmin}
                isUser={isUser}
                submissionId={details.submissionId}
                navigate={navigate}
                onEdit={() => {
                    editors.setEditFormData({
                        name: details.roundData!.name,
                        startDate: toLocalInput(details.roundData!.startDate),
                        endDate: toLocalInput(details.roundData!.endDate),
                        countOfWinners: details.roundData!.countOfWinners,
                        requirements: details.roundData!.requirements,
                        task: details.roundData!.task,
                    });
                    editors.setIsEditingInfo(true);
                    details.setTabValue(0);
                }}
            />

            <Tabs
                value={details.tabValue}
                onChange={(_, v) => {
                    editors.clearErrors();
                    if (editors.isEditingInfo) editors.setIsEditingInfo(false);
                    details.setTabValue(v);
                }}
                sx={{ mb: 4 }}
                textColor="inherit"
                indicatorColor="primary"
                variant="scrollable"
                allowScrollButtonsMobile
            >
                {TABS.map((tab) => <Tab key={tab.id} label={tab.label} />)}
            </Tabs>

            {/* TAB CONTENT RENDERING */}
            {activeTabId === "info" && (
                <RoundInfoTab
                    t={t}
                    state={{
                        roundData: details.roundData,
                        isEditing: editors.isEditingInfo,
                        editFormData: editors.editFormData,
                        setEditFormData: editors.setEditFormData,
                        triggerConfirm: editors.triggerConfirm, // Assuming you added this to useRoundEditors!
                        handleSaveMetadata: () => editors.handleSaveUpdate(editors.editFormData, editors.setIsEditingInfo),
                        setIsEditing: editors.setIsEditingInfo,
                        actions: editors.actions // Exported from useRoundInfoEditor
                    }}
                />
            )}


            {activeTabId === "announcements" && (
                <RoundAnnouncementsTab
                    eventsData={details.eventsData}
                    messagesData={details.messagesData}
                    loadingTab={details.commsLoading}
                    isAdmin={isAdmin}
                    eventsPage={editors.announcements.eventsPage}
                    messagesPage={editors.announcements.messagesPage}
                    onEventsPageChange={editors.announcements.setEventsPage}
                    onMessagesPageChange={editors.announcements.setMessagesPage}
                    // CRUD Actions
                    onOpenCreateEvent={() => editors.announcements.handleOpenEventModal()}
                    onOpenCreateMessage={() => editors.announcements.handleOpenMessageModal()}
                    onEditEvent={editors.announcements.handleOpenEventModal}
                    onEditMessage={editors.announcements.handleOpenMessageModal}
                    onDeleteEvent={editors.announcements.handleDeleteEvent}
                    onDeleteMessage={editors.announcements.handleDeleteMessage}
                    t={t}
                />
            )}

            {activeTabId === "categories" && (
                <RoundCategoriesTab categories={details.categories} loadingTab={details.loadingTab} isAdmin={isAdmin}
                                    isReadOnly={details.roundData?.status === "EVALUATED"}
                                    onOpenCategoryModal={() => editors.setCategoryModalOpen(true)}
                                    onDeleteCategory={editors.handleDeleteCategory} onOpenCriteriaModal={(cid) => {
                    editors.setSelectedCategoryId(cid);
                    editors.setCriteriaModalOpen(true);
                }} onDeleteCriteria={editors.handleDeleteCriteria} t={t} errors={editors.errors}/>
            )}
            {activeTabId === "jury" && (
                <RoundJuryTab jury={details.jury} loadingTab={details.loadingTab} isAdmin={isAdmin}
                              onOpenJuryModal={editors.handleOpenJuryModal} onRemoveJury={editors.handleRemoveJury}
                              t={t} errors={editors.errors}/>
            )}
            {activeTabId === "leaderboard" && (
                <RoundTeamsTab leaderboard={details.leaderboard} setLeaderboard={details.setLeaderboard}
                               loadingTab={details.loadingTab} hasMore={details.hasMore}
                               isNextPageLoading={details.isNextPageLoading}
                               onLoadMore={() => details.loadLeaderboard(false)} roundData={details.roundData!}
                               onOpenStats={editors.handleOpenStats} navigate={details.navigate} t={t} isAdmin={isAdmin}
                               onOpenAddMissingTeamsModal={editors.handleOpenAddMissingModal}
                               onOpenAdvanceTeamsModal={() => editors.handleOpenAdvanceModal()}
                               onUnassignTeam={editors.handleUnassignTeam}
                               onExportLeaderboard={editors.handleExportLeaderboard} isExporting={editors.isExporting}
                               errors={editors.errors}
                               onAssignAllTeams={editors.handleAssignAllTeams}
                               onUnassignAllTeams={editors.handleUnassignAllTeams} myTeamId={details.myTeamId}
                               maxPoints={details.maxPoints}/>
            )}
            {activeTabId === "submissions" && (
                <RoundSubmissionsTab submissions={details.submissions} loadingTab={details.loadingTab}
                                     page={details.submissionsPage} totalPages={details.submissionsTotalPages}
                                     onPageChange={details.fetchSubmissions}
                                     onAutoAssign={() => editors.setAutoAssignModalOpen(true)}
                                     onAssignManual={editors.handleOpenSubmissionJuryModal}
                                     onRemoveJury={editors.handleRemoveJuryFromSubmission} t={t}
                                     errors={editors.errors}/>
            )}
            {activeTabId === "tasks" && (
                <RoundTasksTab tasks={details.tasks} loadingTab={details.loadingTab}
                               onOpenTaskModal={() => editors.setTaskModalOpen(true)}
                               onDeleteTask={editors.handleDeleteTask} onUpdateMeta={editors.handleUpdateTaskMeta}
                               onUpdateTaskText={editors.handleUpdateTaskText} t={t}
                               onAssignTeammate={editors.handleAssignTeammate} myTeamUsers={details.myTeamUsers || []}/>
            )}

            {/* ІСНУЮЧІ МОДАЛКИ (згорнуто для компактності огляду, залишайте як було) */}
            <RoundStatsDialog open={editors.statsModalOpen} onClose={() => editors.setStatsModalOpen(false)}
                              selectedStats={editors.selectedStats} statsViewMode={editors.statsViewMode}
                              setStatsViewMode={editors.setStatsViewMode}
                              aggregatedCriteria={editors.aggregatedCriteria} juryList={editors.juryList}
                              criteriaList={editors.criteriaList} t={t} errors={editors.errors}/>
            <CategoryDialog open={editors.categoryModalOpen} onClose={() => editors.setCategoryModalOpen(false)}
                            newCategoryData={editors.newCategoryData} setNewCategoryData={editors.setNewCategoryData}
                            onSubmit={editors.handleAddCategory} t={t} errors={editors.errors}/>
            <CriteriaDialog open={editors.criteriaModalOpen} onClose={() => editors.setCriteriaModalOpen(false)}
                            newCriteriaText={editors.newCriteriaText} setNewCriteriaText={editors.setNewCriteriaText}
                            onSubmit={editors.handleAddCriteria} t={t} errors={editors.errors}/>
            <JuryDialog open={editors.juryModalOpen} onClose={() => editors.setJuryModalOpen(false)}
                        availableJuries={editors.availableJuries} selectedJury={editors.selectedJuryToAssign}
                        setSelectedJury={editors.setSelectedJuryToAssign} onSubmit={editors.handleAssignJury} t={t}
                        inputValue={editors.inputValue} onInputChange={editors.handleSearchChange}
                        loading={editors.isSearching} page={editors.juryPage} totalPages={editors.juryTotalPages}
                        onPageChange={(_, newPage) => editors.setJuryPage(newPage)}
                        disabledIds={details.jury.map(j => j.id)} errors={editors.errors}/>
            <JuryDialog open={editors.submissionJuryModalOpen} onClose={() => editors.setSubmissionJuryModalOpen(false)}
                        availableJuries={editors.availableSubmissionJuries} selectedJury={editors.selectedJuryToAssign}
                        setSelectedJury={editors.setSelectedJuryToAssign}
                        onSubmit={editors.handleAssignJuryToSubmission} t={t} inputValue={editors.inputValue}
                        onInputChange={editors.handleSearchChange} loading={editors.isSubJurySearching}
                        page={editors.subJuryPage} totalPages={editors.subJuryTotalPages}
                        onPageChange={(_, newPage) => editors.setSubJuryPage(newPage)} errors={editors.errors}/>
            <TaskDialog open={editors.taskModalOpen} onClose={() => editors.setTaskModalOpen(false)}
                        formData={editors.taskFormData} setFormData={editors.setTaskFormData}
                        onSubmit={editors.handleSaveTask} isLoading={editors.isTaskLoading} t={t}
                        errors={editors.errors}/>
            <AddMissingTeamsModal open={editors.addMissingModalOpen}
                                  onClose={() => editors.setAddMissingModalOpen(false)} teams={editors.missingTeams}
                                  selectedIds={editors.selectedMissingIds}
                                  onSelect={(tid: number) => editors.setSelectedMissingIds((prev: number[]) => prev.includes(tid) ? prev.filter(x => x !== tid) : [...prev, tid])}
                                  onSelectAll={(ids: number[]) => editors.setSelectedMissingIds(ids)}
                                  onConfirm={editors.handleConfirmAddMissing} isLoading={editors.isTeamsLoading}
                                  errors={editors.errors} t={t}/>
            <AdvanceTeamsModal open={editors.advanceModalOpen} onClose={() => editors.setAdvanceModalOpen(false)}
                               leaderboard={details.leaderboard} selectedIds={editors.selectedAdvanceIds}
                               onSelect={(tid: number) => editors.setSelectedAdvanceIds((prev: number[]) => prev.includes(tid) ? prev.filter(x => x !== tid) : [...prev, tid])}
                               rounds={editors.tournamentRounds} targetRound={editors.targetAdvanceRoundId}
                               setTargetRound={editors.setTargetAdvanceRoundId} onConfirm={editors.handleConfirmAdvance}
                               isLoading={editors.isTeamsLoading} errors={editors.errors} t={t}/>

            <Dialog open={editors.autoAssignModalOpen} onClose={() => editors.setAutoAssignModalOpen(false)}>
                <DialogTitle>{t("round_details.submissions.auto_assign_title")}</DialogTitle>
                <DialogContent>
                    <ErrorMessages errors={editors.errors}/>
                    <TextField type="number" fullWidth value={editors.kValue}
                               onChange={(e) => editors.setKValue(Number(e.target.value))} inputProps={{min: 1}}/>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => editors.setAutoAssignModalOpen(false)}>{t("common.cancel")}</Button>
                    <Button variant="contained"
                            onClick={editors.handleAutoAssignJuries}>{t("common.yes_confirm")}</Button>
                </DialogActions>
            </Dialog>

            <CreateMessageDialog
                open={editors.announcements.messageModalOpen}
                onClose={() => editors.announcements.setMessageModalOpen(false)}
                onSubmit={editors.announcements.handleSaveMessage}
                initialData={editors.announcements.selectedMessage}
                isLoading={editors.announcements.actionLoading}
                t={t}
            />

            <CreateEventDialog
                open={editors.announcements.eventModalOpen}
                onClose={() => editors.announcements.setEventModalOpen(false)}
                onSubmit={editors.announcements.handleSaveEvent}
                initialData={editors.announcements.selectedEvent}
                isLoading={editors.announcements.actionLoading}
                t={t} isAdmin={isAdmin}            />

            <UniversalConfirmDialog config={editors.confirmDialog} onClose={editors.closeConfirm} errors={editors.errors}/>
        </Box>
    );
};
export default RoundDetailsPage