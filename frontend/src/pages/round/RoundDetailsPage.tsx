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

import {useRoundDetails} from "./RoundDetails/hooks/useRoundDetails";
import {useRoundEditors} from "./RoundDetails/hooks/useRoundEditors";
import {RoundHeader} from "./RoundDetails/components/RoundHeader";
import {RoundInfoTab} from "./RoundDetails/components/RoundInfoTab";
import {RoundCategoriesTab} from "./RoundDetails/components/RoundCategoriesTab";
import {RoundJuryTab} from "./RoundDetails/components/RoundJuryTab";
import {RoundTeamsTab} from "./RoundDetails/components/RoundTeamsTab";
import {RoundStatsDialog} from "./RoundDetails/components/RoundStatsDialog";
import {CategoryDialog} from "./RoundDetails/components/CategoryDialog";
import {JuryDialog} from "./RoundDetails/components/JuryDialog";
import {CriteriaDialog} from "./RoundDetails/components/CriteriaDialog";
import {RoundSubmissionsTab} from "./RoundDetails/components/RoundSubmissionsTab";
import {AddMissingTeamsModal, AdvanceTeamsModal} from "./RoundDetails/components/TeamsModal";
import {UniversalConfirmDialog} from "./RoundDetails/components/UniversalConfirmDialog.tsx";
import {ErrorMessages} from "../../components/main/ErrorMessages.tsx";

export const RoundDetailsPage = () => {
    const { t } = useTranslation();
    const isAdmin = Cookies.get("role") === "ADMIN";
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const details = useRoundDetails(id);
    const editors = useRoundEditors({
        id,
        roundData: details.roundData,
        setRoundData: details.setRoundData,
        fetchCategories: details.fetchCategories,
        fetchJury: details.fetchJury,
        fetchSubmissions: details.fetchSubmissions,
    });

    if (details.loading) return <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}><CircularProgress /></Box>;
    if (!details.roundData) return <Typography sx={{ textAlign: "center", mt: 5 }}>{t("round_details.not_found")}</Typography>;

    return (
        <Box sx={{ pb: 8, pt: 1 }}>
            <RoundHeader
                roundData={details.roundData}
                isAdmin={isAdmin}
                isUser={Cookies.get("role") === "USER"}
                isEditingInfo={editors.isEditingInfo}
                onEdit={() => {
                    editors.setEditFormData({
                        name: details.roundData!.name,
                        startDate: details.roundData!.startDate?.substring(0, 16) || "",
                        endDate: details.roundData!.endDate?.substring(0, 16) || "",
                        countOfWinners: details.roundData!.countOfWinners,
                        requirements: details.roundData!.requirements,
                        task: details.roundData!.task,
                        status: details.roundData!.status,
                    });
                    editors.setIsEditingInfo(true);
                    details.setTabValue(0);
                }}
                navigate={navigate}
                submissionId={details.submissionId}
                onDelete={editors.handleDeleteRound}
                errors={editors.errors}
            />

            <Tabs
                value={details.tabValue}
                onChange={(_, v) => {
                    editors.clearErrors(); // 1. Очищаємо помилки при зміні вкладки
                    if (editors.isEditingInfo) {
                        editors.setIsEditingInfo(false); // 2. (Опціонально) виходимо з режиму редагування Інфо, якщо користувач пішов на інший таб
                    }
                    details.setTabValue(v); // 3. Змінюємо сам таб
                }}
                sx={{ mb: 4 }}
                textColor="inherit"
                indicatorColor="primary"
                variant="scrollable"
            >
                <Tab label={t("round_details.tabs.info")} />
                <Tab label={t("round_details.tabs.categories")} />
                <Tab label={t("round_details.tabs.jury")} />
                {(isAdmin || details.roundData.status === "EVALUATED" || details.roundData.status === "SUBMISSION_CLOSED")&& <Tab label={t("round_details.tabs.leaderboard")} />}
                {isAdmin && <Tab label={t("round_details.tabs.submissions")} />}
            </Tabs>

            {/* Content Tabs */}
            <RoundInfoTab tabValue={details.tabValue} roundData={details.roundData} isAdmin={isAdmin} isEditingInfo={editors.isEditingInfo} editFormData={editors.editFormData} setEditFormData={editors.setEditFormData} handleStatusChange={editors.handleStatusChange} handleSaveUpdate={editors.handleSaveUpdate} cancelEditing={() => editors.setIsEditingInfo(false)} t={t} errors={editors.errors}/>
            <RoundCategoriesTab tabValue={details.tabValue} categories={details.categories} loadingTab={details.loadingTab} isAdmin={isAdmin} onOpenCategoryModal={() => editors.setCategoryModalOpen(true)} onDeleteCategory={editors.handleDeleteCategory} onOpenCriteriaModal={(cid) => { editors.setSelectedCategoryId(cid); editors.setCriteriaModalOpen(true); }} onDeleteCriteria={editors.handleDeleteCriteria} t={t} errors={editors.errors}/>
            <RoundJuryTab tabValue={details.tabValue} jury={details.jury} loadingTab={details.loadingTab} isAdmin={isAdmin} onOpenJuryModal={editors.handleOpenJuryModal} onRemoveJury={editors.handleRemoveJury} t={t} errors={editors.errors}/>
            <RoundTeamsTab tabValue={details.tabValue} leaderboard={details.leaderboard} loadingTab={details.loadingTab} roundData={details.roundData} onOpenStats={editors.handleOpenStats} navigate={details.navigate} t={t} isAdmin={isAdmin} onOpenAddMissingTeamsModal={editors.handleOpenAddMissingModal} onOpenAdvanceTeamsModal={() => editors.handleOpenAdvanceModal()} onUnassignTeam={editors.handleUnassignTeam} onExportLeaderboard={editors.handleExportLeaderboard} isExporting={editors.isExporting} errors={editors.errors}/>

            {isAdmin && (
                <RoundSubmissionsTab tabValue={details.tabValue} submissions={details.submissions} loadingTab={details.loadingTab} page={details.submissionsPage} totalPages={details.submissionsTotalPages} onPageChange={details.fetchSubmissions} onAutoAssign={() => editors.setAutoAssignModalOpen(true)} onAssignManual={editors.handleOpenSubmissionJuryModal} onRemoveJury={editors.handleRemoveJuryFromSubmission} t={t} errors={editors.errors}/>
            )}

            {/* Dialogs */}
            <RoundStatsDialog open={editors.statsModalOpen} onClose={() => editors.setStatsModalOpen(false)} selectedStats={editors.selectedStats} statsViewMode={editors.statsViewMode} setStatsViewMode={editors.setStatsViewMode} aggregatedCriteria={editors.aggregatedCriteria} juryList={editors.juryList} criteriaList={editors.criteriaList} t={t} errors={editors.errors}/>
            <CategoryDialog open={editors.categoryModalOpen} onClose={() => editors.setCategoryModalOpen(false)} newCategoryData={editors.newCategoryData} setNewCategoryData={editors.setNewCategoryData} onSubmit={editors.handleAddCategory} t={t} errors={editors.errors}/>
            <CriteriaDialog open={editors.criteriaModalOpen} onClose={() => editors.setCriteriaModalOpen(false)} newCriteriaText={editors.newCriteriaText} setNewCriteriaText={editors.setNewCriteriaText} onSubmit={editors.handleAddCriteria} t={t} errors={editors.errors}/>

            {/* Модалка для Глобального журі раунду */}
            <JuryDialog
                open={editors.juryModalOpen}
                onClose={() => editors.setJuryModalOpen(false)}
                availableJuries={editors.availableJuries}
                selectedJury={editors.selectedJuryToAssign}
                setSelectedJury={editors.setSelectedJuryToAssign}
                onSubmit={editors.handleAssignJury}
                t={t}
                inputValue={editors.inputValue}
                onInputChange={editors.handleSearchChange}
                loading={editors.isSearching}
                // Пагінація
                page={editors.juryPage}
                totalPages={editors.juryTotalPages}
                onPageChange={(_, newPage) => editors.setJuryPage(newPage)}
                // Блокуємо тих, хто вже призначений в раунд
                disabledIds={details.jury.map(j => j.id)}
                errors={editors.errors}
            />

            {/* Модалка для Сабмішну */}
            <JuryDialog
                open={editors.submissionJuryModalOpen}
                onClose={() => editors.setSubmissionJuryModalOpen(false)}
                availableJuries={editors.availableSubmissionJuries}
                selectedJury={editors.selectedJuryToAssign}
                setSelectedJury={editors.setSelectedJuryToAssign}
                onSubmit={editors.handleAssignJuryToSubmission}
                t={t}
                inputValue={editors.inputValue}
                onInputChange={editors.handleSearchChange}
                loading={editors.isSubJurySearching}
                // Пагінація
                page={editors.subJuryPage}
                totalPages={editors.subJuryTotalPages}
                onPageChange={(_, newPage) => editors.setSubJuryPage(newPage)}
                // Тут disabledIds не потрібен, бо ендпоінт getAvailableJuries
                // і так повертає лише тих, кого можна додати.
                errors={editors.errors}
            />

            {/* Teams Management Modals */}
            <AddMissingTeamsModal open={editors.addMissingModalOpen} onClose={() => editors.setAddMissingModalOpen(false)} teams={editors.missingTeams} selectedIds={editors.selectedMissingIds} onSelect={(tid: number) => editors.setSelectedMissingIds(prev => prev.includes(tid) ? prev.filter(x => x !== tid) : [...prev, tid])} onConfirm={editors.handleConfirmAddMissing} isLoading={editors.isTeamsLoading} errors={editors.errors}/>
            <AdvanceTeamsModal open={editors.advanceModalOpen} onClose={() => editors.setAdvanceModalOpen(false)} leaderboard={details.leaderboard} selectedIds={editors.selectedAdvanceIds} onSelect={(tid: number) => editors.setSelectedAdvanceIds(prev => prev.includes(tid) ? prev.filter(x => x !== tid) : [...prev, tid])} rounds={editors.tournamentRounds} targetRound={editors.targetAdvanceRoundId} setTargetRound={editors.setTargetAdvanceRoundId} onConfirm={editors.handleConfirmAdvance} isLoading={editors.isTeamsLoading} errors={editors.errors}/>

            <Dialog open={editors.autoAssignModalOpen} onClose={() => editors.setAutoAssignModalOpen(false)}>
                <DialogTitle>{t("round_details.submissions.auto_assign_title")}</DialogTitle>
                <DialogContent>
                    <ErrorMessages errors={editors.errors}/>
                    <TextField type="number" fullWidth value={editors.kValue} onChange={(e) => editors.setKValue(Number(e.target.value))} inputProps={{ min: 1 }} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => editors.setAutoAssignModalOpen(false)}>{t("common.cancel")}</Button>
                    <Button variant="contained" onClick={editors.handleAutoAssignJuries}>{t("common.yes_confirm")}</Button>
                </DialogActions>
            </Dialog>

            <UniversalConfirmDialog
                config={editors.confirmDialog}
                onClose={editors.closeConfirm}
            />
        </Box>
    );
};