import {useEffect, useState} from 'react';
import {useTranslation} from "react-i18next";
import {toLocalInput} from "../../../../../utils/data.ts";

export const useRoundTimer = (endDate: string, status: string) => {
    const { t } = useTranslation(); // Initialize translation
    const [timeLeft, setTimeLeft] = useState("");
    const [urgencyColor, setUrgencyColor] = useState("white");

    useEffect(() => {
        if (status !== "ACTIVE") return;

        const updateTimer = () => {
            const end = new Date(toLocalInput(endDate)).getTime();
            const now = new Date().getTime();
            const diff = end - now;

            if (diff <= 0) {
                setTimeLeft(t('timer.expired', 'Вичерпано'));
                setUrgencyColor("#ff5252");
                return;
            }

            const d = Math.floor(diff / (1000 * 60 * 60 * 24));
            const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);

            if (diff < 3600000) setUrgencyColor("#ff5252");
            else if (diff < 86400000) setUrgencyColor("#ffb74d");
            else setUrgencyColor("white");

            // Use translation keys for units
            const days = `${d}${t('timer.days', 'д')}`;
            const hours = `${h}${t('timer.hours', 'год')}`;
            const mins = `${m}${t('timer.mins', 'хв')}`;
            const secs = `${s}${t('timer.secs', 'с')}`;

            setTimeLeft(`${days} ${hours} ${mins} ${secs}`);
        };

        const timer = setInterval(updateTimer, 1000);
        updateTimer();
        return () => clearInterval(timer);
    }, [endDate, status, t]); // Added t to dependencies

    return { timeLeft, urgencyColor };
};