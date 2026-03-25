import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';

import PageContainer from './pages/PageContainer';
import PrivateRoute from "./security/PrivateRoute.tsx";
import Callback from "./security/Callback.tsx";
import HomePage from "./pages/home/HomePage.tsx";
import {TournamentsPage} from "./pages/tournament/TournamentsPage.tsx";
import LoginPage from "./pages/home/LoginPage.tsx";
import {TeamsPage} from "./pages/team/TeamsPage.tsx";
import {ProfilePage} from "./pages/user/ProfilePage.tsx";
import {TournamentDetailsPage} from "./pages/tournament/TournamentDetailsPage.tsx";
import {TeamDetailsPage} from "./pages/team/TeamDetailsPage.tsx";
import {RoundDetailsPage} from "./pages/round/RoundDetailsPage.tsx";
import {CreateJuryPage} from "./pages/jury/CreateJuryPage.tsx";
import {CreateTeamPage} from "./pages/team/CreateTeamPage.tsx";

// НОВІ СТОРІНКИ
import {TeamSubmissionPage} from "./pages/submission/TeamSubmissionPage.tsx";
import {JurySubmissionsPage} from "./pages/jury/JurySubmissionsPage.tsx";
import {JuryEvaluatePage} from "./pages/jury/JuryEvaluatePage.tsx";

import AuthInit from "./security/AuthInit.tsx";

const App: React.FC = () => {

    return (
        <Router>
            <AuthInit>
                <Routes>
                    {/* Публічні маршрути */}
                    <Route path="/" element={<PageContainer><HomePage/></PageContainer>}/>
                    <Route path="/home" element={<PageContainer><HomePage/></PageContainer>}/>
                    <Route path="/login" element={<PageContainer><LoginPage/></PageContainer>}/>
                    <Route path="/callback" element={<Callback/>}/>

                    {/* Турніри та Раунди */}
                    <Route path="/tournaments" element={<PageContainer><TournamentsPage/></PageContainer>}/>
                    <Route path="/tournaments/:id" element={<PageContainer><TournamentDetailsPage/></PageContainer>}/>
                    <Route path="/rounds/:id" element={<PageContainer><RoundDetailsPage/></PageContainer>}/>

                    {/* Приватні маршрути (Потребують авторизації) */}
                    <Route element={<PrivateRoute/>}>
                        {/* Профіль та Команди */}
                        <Route path="/profile" element={<PageContainer><ProfilePage/></PageContainer>}/>
                        <Route path="/teams" element={<PageContainer><TeamsPage/></PageContainer>}/>
                        <Route path="/teams/:id" element={<PageContainer><TeamDetailsPage/></PageContainer>}/>
                        <Route path="/tournaments/:tournamentId/team/create" element={<PageContainer><CreateTeamPage/></PageContainer>}/>

                        {/* --- СТОРИНКИ КОМАНДИ --- */}
                        {/* Подача роботи: :submissionId? робимо опціональним, бо для нового сабміту його не буде */}
                        <Route path="/rounds/:roundId/submission/:submissionId?" element={<PageContainer><TeamSubmissionPage/></PageContainer>}/>

                        {/* --- СТОРІНКИ ЖУРІ --- */}
                        <Route path="/jury/submissions" element={<PageContainer><JurySubmissionsPage/></PageContainer>}/>
                        <Route path="/jury/evaluate/:submissionId" element={<PageContainer><JuryEvaluatePage/></PageContainer>}/>

                        {/* --- СТОРІНКИ АДМІНІСТРАТОРА --- */}
                        <Route path="/admin/jury/create" element={<PageContainer><CreateJuryPage/></PageContainer>}/>
                        <Route path="/admin/teams" element={<PageContainer><TeamsPage/></PageContainer>}/>
                        {/* Сюди можна додати /admin/teams тощо */}
                    </Route>

                    {/* Backward compatibility (якщо десь залишились старі лінки) */}
                    <Route path="/jury/create" element={<PageContainer><CreateJuryPage/></PageContainer>}/>
                </Routes>
            </AuthInit>
        </Router>
    );
};

export default App;