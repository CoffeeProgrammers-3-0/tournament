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