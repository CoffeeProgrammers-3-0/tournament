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


const App: React.FC = () => {

    return (
        <Router>
            <Routes>
                <Route path="/" element={<PageContainer><HomePage/></PageContainer>}/>
                <Route path="/tournaments" element={<PageContainer><TournamentsPage/></PageContainer>}/>
                <Route path="/profile" element={<PageContainer><ProfilePage/></PageContainer>}/>
                <Route path="/callback" element={<Callback />} />
                <Route element={<PrivateRoute/>}>
                    <Route path="/login" element={<PageContainer><LoginPage/></PageContainer>}/>
                    <Route path="/teams" element={<PageContainer><TeamsPage/></PageContainer>}/>
                </Route>
            </Routes>
        </Router>
    );
};

export default App;
