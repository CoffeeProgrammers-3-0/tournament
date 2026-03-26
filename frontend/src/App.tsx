import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';

import PageContainer from './pages/PageContainer';
import PrivateRoute from "./security/PrivateRoute.tsx";
import Callback from "./security/Callback.tsx";
import HomePage from "./pages/home/Home/HomePage.tsx";
import {TournamentsPage} from "./pages/tournament/TournamentsList/TournamentsPage.tsx";
import LoginPage from "./pages/home/Login/LoginPage.tsx";
import {TeamsPage} from "./pages/team/TeamsList/TeamsPage.tsx";
import {ProfilePage} from "./pages/user/profile/ProfilePage.tsx";
import TournamentDetailsPage from "./pages/tournament/TournamentDetails/TournamentDetailsPage.tsx";
import {TeamDetailsPage} from "./pages/team/TeamDetails/TeamDetailsPage.tsx";
import {RoundDetailsPage} from "./pages/round/RoundDetailsPage.tsx";
import {CreateTeamPage} from "./pages/team/CreateTeam/CreateTeamPage.tsx";
import {TeamSubmissionPage} from "./pages/submission/TeamSubmissionPage.tsx";
import {JurySubmissionsPage} from "./pages/jury/JurySubmissions/JurySubmissionsPage.tsx";
import {JuryEvaluatePage} from "./pages/jury/JuryEvaluated/JuryEvaluatePage.tsx";
import {JuryManagementPage} from "./pages/jury/JuryManagment/JuryManagementPage.tsx";

import AuthInit from "./security/AuthInit.tsx";


const App: React.FC = () => {

    return (
        <Router>
            <AuthInit>
                <Routes>
                    {/* --- ПУБЛІЧНІ (Доступні гостям) --- */}
                    <Route path="/" element={<PageContainer><HomePage/></PageContainer>}/>
                    <Route path="/home" element={<PageContainer><HomePage/></PageContainer>}/>
                    <Route path="/callback" element={<Callback/>}/>

                    {/* LoginPage має бути ТУТ, а не в PrivateRoute! */}
                    <Route path="/login" element={<PageContainer><LoginPage/></PageContainer>}/>

                    <Route path="/tournaments/:tournamentId/team/create" element={<PageContainer><CreateTeamPage/></PageContainer>}/>

                    <Route path="/tournaments" element={<PageContainer><TournamentsPage/></PageContainer>}/>
                    <Route path="/tournaments/:id" element={<PageContainer><TournamentDetailsPage/></PageContainer>}/>
                    <Route path="/rounds/:id" element={<PageContainer><RoundDetailsPage/></PageContainer>}/>

                    {/* --- ПРИВАТНІ (Тільки після авторизації) --- */}
                    <Route element={<PrivateRoute/>}>
                        <Route path="/profile" element={<PageContainer><ProfilePage/></PageContainer>}/>
                        <Route path="/teams" element={<PageContainer><TeamsPage/></PageContainer>}/>
                        <Route path="/teams/:id" element={<PageContainer><TeamDetailsPage/></PageContainer>}/>

                        <Route path="/rounds/:roundId/submission/:submissionId?" element={<PageContainer><TeamSubmissionPage/></PageContainer>}/>
                        <Route path="/jury/submissions" element={<PageContainer><JurySubmissionsPage/></PageContainer>}/>
                        <Route path="/jury/evaluate/:submissionId" element={<PageContainer><JuryEvaluatePage/></PageContainer>}/>
                        <Route path="/admin/jury/managment" element={<PageContainer><JuryManagementPage/></PageContainer>}/>
                        <Route path="/admin/teams" element={<PageContainer><TeamsPage/></PageContainer>}/>
                        <Route path="/admin/teams/create" element={<PageContainer><CreateTeamPage/></PageContainer>}/>
                    </Route>
                </Routes>
            </AuthInit>
        </Router>
    );
};

export default App;