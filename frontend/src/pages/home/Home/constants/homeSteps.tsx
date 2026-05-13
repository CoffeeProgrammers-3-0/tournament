import GroupsIcon from '@mui/icons-material/Groups';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import type {TFunction} from "i18next";

export const getHomeSteps = (t: TFunction) => [
    {
        icon: <GroupsIcon fontSize="inherit" />,
        title: t("home.how_it_works.steps.step2.title"),
        description: t("home.how_it_works.steps.step2.desc"),
        color: "#9c27b0" // secondary
    },
    {
        icon: <EmojiEventsIcon fontSize="inherit" />,
        title: t("home.how_it_works.steps.step3.title"),
        description: t("home.how_it_works.steps.step3.desc"),
        color: "#ed6c02" // warning
    }
];