import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';

import HomePage from './pages/home/HomePage';
import PageContainer from './pages/PageContainer';
import PrivateRoute from "./security/PrivateRoute.tsx";
import Callback from "./security/Callback.tsx";
import ShopPage from "./pages/shop/ShopPage.tsx";
import ProfilePage from "./pages/profile/UserProfilePage.tsx";
import ShopItemCreatePage from "./pages/shop/ShopItemCreatePage.tsx";
import ShopItemFullPage from "./pages/shop/ShopItemFullPage.tsx";
import UserPublicProfilePage from "./pages/profile/UserPublicProfilePage.tsx";
import ChatPage from "./pages/chat/ChatPage.tsx";
import AllChatsPage from "./pages/chat/AllChatsPage.tsx";
import NotificationPage from "./pages/notification/NotificationPage.tsx";



const App: React.FC = () => {

    return (
        <Router>
            <Routes>
                <Route path="/callback" element={<Callback />} />
                <Route element={<PrivateRoute/>}>
                    <Route path="/" element={<PageContainer><HomePage/></PageContainer>}/>
                    <Route path="/home" element={<PageContainer><HomePage/></PageContainer>}/>
                    <Route path="/shop-item" element={<PageContainer><ShopPage/></PageContainer>}/>
                    <Route path="/profile" element={<PageContainer><ProfilePage/></PageContainer>}/>
                    <Route path="/shop-item/create" element={<PageContainer><ShopItemCreatePage/></PageContainer>}/>
                    <Route path="/shop-item/:id" element={<PageContainer><ShopItemFullPage/></PageContainer>}/>
                    <Route path="/user/:id" element={<PageContainer><UserPublicProfilePage/></PageContainer>}/>
                    <Route path="/chat" element={<PageContainer><AllChatsPage/></PageContainer>}/>
                    <Route path="/chat/:id" element={<PageContainer><ChatPage/></PageContainer>}/>
                    <Route path="/notification" element={<PageContainer><NotificationPage/></PageContainer>}/>
                </Route>
            </Routes>
        </Router>
    );
};

export default App;
