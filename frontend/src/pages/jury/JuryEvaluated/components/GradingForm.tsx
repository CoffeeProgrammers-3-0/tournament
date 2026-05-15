import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Divider,
    InputAdornment,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export const GradingForm = ({
                                categories = [],
                                scores = {},
                                onScoreChange,
                                disabled,
                                customCriteria = [],
                                onCustomCriteriaChange,
                                t
                            }: any) => (
    <>
        {categories.map((category: any) => (
            <Accordion key={category.id} defaultExpanded sx={accordionStyles}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: "action.hover", px: 3 }}>
                    <Box>
                        <Typography variant="subtitle1" fontWeight={800}>{category.title}</Typography>
                        <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700 }}>
                            {t('jury.max_points')}: {category.weight <= 1 ? category.weight * 100 : category.weight}
                        </Typography>
                    </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 3 }}>
                    {category.criteria.map((criteria: any, index: number) => {
                        const criteriaData = scores[criteria.id] || { points: "", comment: "" };
                        return (
                            <Box key={criteria.id} sx={{ py: 2 }}>
                                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="body1" fontWeight={600} sx={{ mb: 1.5 }}>{criteria.text}</Typography>
                                        <TextField
                                            type="number"
                                            size="small"
                                            value={criteriaData.points}
                                            onChange={(e) => onScoreChange(criteria.id, 'points', e.target.value)}
                                            disabled={disabled}
                                            InputProps={{
                                                endAdornment: <InputAdornment position="end">/ 100</InputAdornment>,
                                                sx: { borderRadius: '10px', width: '140px', fontWeight: 700 }
                                            }}
                                        />
                                    </Box>
                                    <Box sx={{ width: { xs: '100%', md: '45%' } }}>
                                        <TextField
                                            fullWidth multiline rows={2}
                                            placeholder={t('jury.comment_placeholder')}
                                            value={criteriaData.comment}
                                            onChange={(e) => onScoreChange(criteria.id, 'comment', e.target.value)}
                                            disabled={disabled}
                                            InputProps={{ sx: { borderRadius: '12px' } }}
                                        />
                                    </Box>
                                </Stack>
                                {index < category.criteria.length - 1 && <Divider sx={{ mt: 2, opacity: 0.5 }} />}
                            </Box>
                        );
                    })}
                </AccordionDetails>
            </Accordion>
        ))}

        <Box sx={{ mt: 6, p: 3, borderRadius: '24px', bgcolor: 'grey.50', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight={800} gutterBottom>{t('jury.custom_criteria_title')}</Typography>

            {customCriteria?.map((custom: any) => (
                <Box key={custom.id} sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: '16px', boxShadow: 1 }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="flex-start">
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                fullWidth label="Назва критерію" size="small"
                                value={custom.text}
                                onChange={(e) => onCustomCriteriaChange(custom.id, 'text', e.target.value)}
                                disabled={disabled}
                            />
                            <TextField
                                type="number" label="Бали" size="small"
                                value={custom.points}
                                onChange={(e) => onCustomCriteriaChange(custom.id, 'points', e.target.value)}
                                disabled={disabled}
                                inputProps={{max: 5, min: 0}}
                                InputProps={{endAdornment: <InputAdornment position="end">/ 5</InputAdornment>, sx: { width: '120px' } }}
                            />
                        </Box>
                        <TextField
                            sx={{ width: { xs: '100%', md: '40%' } }}
                            multiline rows={2} placeholder="Коментар..."
                            value={custom.comment}
                            onChange={(e) => onCustomCriteriaChange(custom.id, 'comment', e.target.value)}
                            disabled={disabled}
                        />
                    </Stack>
                </Box>
            ))}
        </Box>
    </>
);

const accordionStyles = {
    mb: 3,
    borderRadius: "24px !important",
    overflow: "hidden",
    border: "1px solid",
    borderColor: "divider",
    boxShadow: "none",
    '&:before': { display: 'none' }
};