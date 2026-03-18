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
import AuthInit from "./security/AuthInit.tsx";


const App: React.FC = () => {

    return (
        <Router>
            <AuthInit>
                <Routes>
                    <Route path="/" element={<PageContainer><HomePage/></PageContainer>}/>
                    <Route path="/tournaments" element={<PageContainer><TournamentsPage/></PageContainer>}/>
                    <Route path="/tournaments/:id" element={<PageContainer><TournamentDetailsPage/></PageContainer>}/>
                    <Route path="/rounds/:id" element={<PageContainer><RoundDetailsPage/></PageContainer>}/>
                    <Route path="/callback" element={<Callback/>}/>
                    <Route path="/jury/create" element={<PageContainer><CreateJuryPage/></PageContainer>}/>
                    <Route path="/tournaments/:tournamentId/team/create"
                           element={<PageContainer><CreateTeamPage/></PageContainer>}/>
                    <Route element={<PrivateRoute/>}>
                        <Route path="/login" element={<PageContainer><LoginPage/></PageContainer>}/>
                        <Route path="/teams" element={<PageContainer><TeamsPage/></PageContainer>}/>
                        <Route path="/teams/:id" element={<PageContainer><TeamDetailsPage/></PageContainer>}/>
                        <Route path="/profile" element={<PageContainer><ProfilePage/></PageContainer>}/>
                    </Route>
                </Routes>
            </AuthInit>
        </Router>
    );
};

export default App;
