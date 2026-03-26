import {Box, CircularProgress, Tab, Tabs, Typography} from "@mui/material";
import {useTranslation} from "react-i18next";
import Cookies from "js-cookie";
import {useParams} from "react-router-dom";

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

export const RoundDetailsPage = () => {
    const { t } = useTranslation();
    const isAdmin = Cookies.get("role") === "ADMIN";
    const { id } = useParams<{ id: string }>();

    const details = useRoundDetails(id);
    const editors = useRoundEditors({
        id,
        roundData: details.roundData,
        setRoundData: details.setRoundData,
        fetchCategories: details.fetchCategories,
        fetchJury: details.fetchJury,
        currentJury: details.jury, // ДОДАНО ПАРАМЕТР
    });

    if (details.loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!details.roundData) {
        return <Typography sx={{ textAlign: "center", mt: 5 }}>{t("round_details.not_found")}</Typography>;
    }

    return (
        <Box sx={{ pb: 8, pt: 1 }}>
            <RoundHeader
                roundData={details.roundData}
                isAdmin={isAdmin}
                isEditingInfo={editors.isEditingInfo}
                onEdit={() => {
                    editors.setEditFormData({
                        name: details.roundData?.name || "",
                        startDate: details.roundData?.startDate?.substring(0, 16) || "",
                        endDate: details.roundData?.endDate?.substring(0, 16) || "",
                        countOfWinners: details.roundData?.countOfWinners || 0,
                        requirements: details.roundData?.requirements || "",
                        task: details.roundData?.task || "",
                        status: details.roundData?.status || "DRAFT",
                    });
                    editors.setIsEditingInfo(true);
                }}
            />

            <Tabs value={details.tabValue} onChange={(_, v) => details.setTabValue(v)} sx={{ mb: 4 }} textColor="inherit" indicatorColor="primary">
                <Tab label={t("round_details.tabs.info")} />
                <Tab label={t("round_details.tabs.categories")} />
                <Tab label={t("round_details.tabs.jury")} />
                <Tab label={t("round_details.tabs.teams")} />
            </Tabs>

            <RoundInfoTab
                tabValue={details.tabValue}
                roundData={details.roundData}
                isAdmin={isAdmin}
                isEditingInfo={editors.isEditingInfo}
                editFormData={editors.editFormData}
                setEditFormData={editors.setEditFormData}
                handleStatusChange={editors.handleStatusChange}
                handleSaveUpdate={editors.handleSaveUpdate}
                cancelEditing={editors.cancelEditing}
                t={t}
            />

            <RoundCategoriesTab
                tabValue={details.tabValue}
                categories={details.categories}
                loadingTab={details.loadingTab}
                isAdmin={isAdmin}
                onOpenCategoryModal={() => editors.setCategoryModalOpen(true)}
                onDeleteCategory={editors.handleDeleteCategory}
                onOpenCriteriaModal={(categoryId) => {
                    editors.setSelectedCategoryId(categoryId);
                    editors.setCriteriaModalOpen(true);
                }}
                onDeleteCriteria={editors.handleDeleteCriteria}
                t={t}
            />

            <RoundJuryTab
                tabValue={details.tabValue}
                jury={details.jury}
                loadingTab={details.loadingTab}
                isAdmin={isAdmin}
                onOpenJuryModal={editors.handleOpenJuryModal} // ЗМІНЕНО: тепер викликаємо метод завантаження
                onRemoveJury={editors.handleRemoveJury}
                t={t}
            />

            <RoundTeamsTab
                tabValue={details.tabValue}
                leaderboard={details.leaderboard}
                loadingTab={details.loadingTab}
                roundData={details.roundData}
                onOpenStats={editors.handleOpenStats}
                navigate={details.navigate}
                t={t}
            />

            <RoundStatsDialog
                open={editors.statsModalOpen}
                onClose={() => editors.setStatsModalOpen(false)}
                selectedStats={editors.selectedStats}
                statsViewMode={editors.statsViewMode}
                setStatsViewMode={editors.setStatsViewMode}
                aggregatedCriteria={editors.aggregatedCriteria}
                juryList={editors.juryList}
                criteriaList={editors.criteriaList}
                t={t}
            />

            <CategoryDialog
                open={editors.categoryModalOpen}
                onClose={() => editors.setCategoryModalOpen(false)}
                newCategoryData={editors.newCategoryData}
                setNewCategoryData={editors.setNewCategoryData}
                onSubmit={editors.handleAddCategory}
                t={t}
            />

            <JuryDialog
                open={editors.juryModalOpen}
                onClose={() => {
                    editors.setJuryModalOpen(false);
                    editors.setSelectedJuryToAssign(null);
                }}
                availableJuries={editors.availableJuries}
                selectedJury={editors.selectedJuryToAssign}
                setSelectedJury={editors.setSelectedJuryToAssign}
                onSubmit={editors.handleAssignJury}
                t={t}
                // НОВІ ПРОПСИ:
                inputValue={editors.inputValue}
                onInputChange={editors.setInputValue}
                loading={editors.isSearching}
            />

            <CriteriaDialog
                open={editors.criteriaModalOpen}
                onClose={() => {
                    editors.setCriteriaModalOpen(false);
                    editors.setNewCriteriaText("");
                    editors.setSelectedCategoryId(null);
                }}
                newCriteriaText={editors.newCriteriaText}
                setNewCriteriaText={editors.setNewCriteriaText}
                onSubmit={editors.handleAddCriteria}
                t={t}
            />
        </Box>
    );
};