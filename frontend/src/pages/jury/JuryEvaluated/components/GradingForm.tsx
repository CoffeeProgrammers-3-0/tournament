import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Divider,
    FormControlLabel,
    Grid,
    InputAdornment,
    Stack,
    Switch,
    TextField,
    Tooltip,
    Typography
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import StarIcon from "@mui/icons-material/Star";

export const GradingForm = ({ categories, scores, onScoreChange, disabled, additionalCount, t }: any) => (
    <>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 3 }}>
            <Typography variant="h5" fontWeight={900} sx={{ letterSpacing: '-0.02em' }}>
                {t('jury.grading_rubric')}
            </Typography>
            <Typography variant="subtitle2" color={additionalCount >= 4 ? "error.main" : "text.secondary"} fontWeight={700}>
                {t('jury.bonus_used', 'Bonus used')}: {additionalCount} / 4
            </Typography>
        </Box>

        {categories.map((category: any) => {
            // If weight is a fraction like 0.1, max points are 10. If it's stored as 10, it's 10.
            const maxCategoryPoints = category.weight <= 1 ? category.weight * 100 : category.weight;

            return (
                <Accordion
                    key={category.id}
                    defaultExpanded
                    sx={{
                        mb: 3,
                        borderRadius: "24px !important",
                        overflow: "hidden",
                        border: "1px solid",
                        borderColor: "divider",
                        boxShadow: "none",
                        '&:before': { display: 'none' }
                    }}
                >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: "action.hover", px: 3 }}>
                        <Box>
                            <Typography variant="subtitle1" fontWeight={800}>{category.title}</Typography>
                            <Typography variant="caption" sx={{ display: 'block', opacity: 0.8, fontWeight: 700, color: 'primary.main' }}>
                                {t('jury.max_points', 'Max Points for Category')}: {maxCategoryPoints}
                                {category.weight <= 1 && ` (Weight: ${category.weight * 100}%)`}
                            </Typography>
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: { xs: 2, md: 3 } }}>
                        <Grid container spacing={0}>
                            {category.criteria.map((criteria: any, index: number) => {
                                const criteriaData = scores[criteria.id] || { points: "", comment: "", additional: false };
                                // Disable the bonus switch if we're at the limit of 4 AND this specific switch isn't already turned on
                                const isBonusDisabled = disabled || (!criteriaData.additional && additionalCount >= 4);

                                return (
                                    <Grid size={{ xs: 12 }} key={criteria.id}>
                                        <Box sx={{ py: 2 }}>
                                            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ xs: 'stretch', md: 'flex-start' }} justifyContent="space-between">

                                                {/* Left Side: Criteria Text & Points */}
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="body1" sx={{ mb: 2, fontWeight: 600, color: disabled ? 'text.secondary' : 'text.primary' }}>
                                                        {criteria.text}
                                                    </Typography>

                                                    <Stack direction="row" spacing={2} alignItems="center">
                                                        <TextField
                                                            type="number"
                                                            placeholder="0"
                                                            size="small"
                                                            value={criteriaData.points}
                                                            onChange={(e) => onScoreChange(criteria.id, 'points', e.target.value)}
                                                            disabled={disabled}
                                                            InputProps={{
                                                                endAdornment: <InputAdornment position="end">/ 100</InputAdornment>,
                                                                sx: { borderRadius: '10px', fontWeight: 700, width: "140px" }
                                                            }}
                                                        />

                                                        <Tooltip title={isBonusDisabled && !criteriaData.additional ? "Max 4 bonus points reached" : ""}>
                                                            <FormControlLabel
                                                                control={
                                                                    <Switch
                                                                        color="warning"
                                                                        checked={criteriaData.additional}
                                                                        onChange={(e) => onScoreChange(criteria.id, 'additional', e.target.checked)}
                                                                        disabled={isBonusDisabled}
                                                                    />
                                                                }
                                                                label={
                                                                    <Typography variant="body2" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: criteriaData.additional ? 'warning.dark' : 'text.secondary' }}>
                                                                        <StarIcon fontSize="small" sx={{ mb: '2px' }} /> Bonus (+5 pts)
                                                                    </Typography>
                                                                }
                                                                sx={{ m: 0 }}
                                                            />
                                                        </Tooltip>
                                                    </Stack>
                                                </Box>

                                                {/* Right Side: Comment Field */}
                                                <Box sx={{ width: { xs: '100%', md: '45%' } }}>
                                                    <TextField
                                                        fullWidth
                                                        multiline
                                                        rows={3}
                                                        placeholder={t('jury.comment_placeholder', 'Add constructive feedback here...')}
                                                        value={criteriaData.comment}
                                                        onChange={(e) => onScoreChange(criteria.id, 'comment', e.target.value)}
                                                        disabled={disabled}
                                                        InputProps={{ sx: { borderRadius: '12px', fontSize: '0.9rem' } }}
                                                    />
                                                </Box>

                                            </Stack>
                                        </Box>
                                        {index < category.criteria.length - 1 && <Divider sx={{ opacity: 0.6 }} />}
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </AccordionDetails>
                </Accordion>
            );
        })}
    </>
);