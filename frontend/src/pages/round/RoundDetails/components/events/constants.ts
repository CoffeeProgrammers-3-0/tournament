import {styled} from '@mui/material/styles';
import {Box} from "@mui/material";

export const quillModules = {
    toolbar: [
        [{ 'header': [1, 2, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['link', 'clean']
    ],
};

export const HtmlContent = styled(Box)(({ theme }) => ({
    color: theme.palette.text.primary,
    fontSize: '0.9rem',
    lineHeight: 1.6,
    wordBreak: 'break-word',
    '& p': { margin: 0, marginBottom: theme.spacing(1) },
    '& ul, & ol': { paddingLeft: theme.spacing(3), marginBottom: theme.spacing(1) },
    '& a': { color: theme.palette.primary.main, textDecoration: 'underline' },
    '& blockquote': {
        borderLeft: `4px solid ${theme.palette.divider}`,
        paddingLeft: theme.spacing(2),
        fontStyle: 'italic',
        margin: theme.spacing(1, 0)
    },
    '& :last-child': { marginBottom: 0 }
}));

/**
 * Formats a date string/Date object based on the current i18n language.
 */
export const formatDateByLocale = (dateInput: string | Date, lang: string) => {
    const locale = lang === 'uk' ? 'uk-UA' : 'en-GB';
    return new Date(dateInput).toLocaleString(locale, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

/**
 * Converts a date to a format compatible with <input type="datetime-local"> (YYYY-MM-DDTHH:mm)
 * strictly using the local system time.
 */
export const toDateTimeLocalValue = (dateInput: string | Date | number) => {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '';

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
};