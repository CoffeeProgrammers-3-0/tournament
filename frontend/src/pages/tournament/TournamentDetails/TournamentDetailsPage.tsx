import {Box, CircularProgress, Container, Tab, Tabs, Typography} from "@mui/material";
import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router-dom";

import {useTournamentDetails} from "./useTournamentDetails.ts";
import {TournamentHero} from "./components/TournamentHero";
import {CreateRoundDialog} from "./components/CreateRoundDialog";
import {InfoTab} from "./tabs/InfoTab";
import {RoundsTab} from "./tabs/RoundsTab";
import {TeamsTab} from "./tabs/TeamsTab";

export const TournamentDetailsPage = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const state = useTournamentDetails();

    const formatDate = (dateString?: string) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleString(i18n.language === "uk" ? "uk-UA" : "en-US", {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    if (state.loading) {
        return <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}><CircularProgress /></Box>;
    }

    if (!state.tournamentData) {
        return <Typography align="center" mt={10}>Tournament not found</Typography>;
    }

    return (
        <Container maxWidth="lg" sx={{ pb: 6, pt: 1 }}>
            <TournamentHero state={state} formatDate={formatDate} t={t} navigate={navigate} />

            <Tabs
                value={state.tabValue}
                onChange={(_, v) => state.setTabValue(v)}
                sx={{ mb: 4, borderBottom: 1, borderColor: 'divider', '& .MuiTab-root': { fontWeight: 700, fontSize: "1rem" } }}
            >
                {((state.tournamentData.status === "RUNNING" || state.tournamentData.status === "FINISHED") ? ['info', 'rounds', 'teams'] : ['info', 'rounds']).map((label, idx) => (
                    <Tab key={idx} label={t(`tournament_details.tabs.${label}`)} />
                ))}
            </Tabs>

            <Box sx={{ mt: 2 }}>
                {state.tabValue === 0 && <InfoTab state={state} formatDate={formatDate} t={t} />}
                {state.tabValue === 1 && <RoundsTab state={state} formatDate={formatDate} t={t} navigate={navigate} />}
                {state.tabValue === 2
                    && (state.tournamentData.status === "RUNNING" || state.tournamentData.status === "FINISHED")
                    && <TeamsTab state={state} t={t} navigate={navigate} />}
            </Box>

            <CreateRoundDialog state={state} t={t} tournament={state.tournamentData}/>
        </Container>
    );
};

export default TournamentDetailsPage;