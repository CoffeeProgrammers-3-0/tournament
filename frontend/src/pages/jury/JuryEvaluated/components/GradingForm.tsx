import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Divider,
    Grid,
    InputAdornment,
    TextField,
    Typography
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export const GradingForm = ({ categories, scores, onScoreChange, disabled, t }: any) => (
    <>
        <Typography variant="h5" fontWeight={900} sx={{ mb: 3, letterSpacing: '-0.02em' }}>
            {t('jury.grading_rubric')}
        </Typography>
        {categories.map((category: any) => (
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
                        <Typography variant="caption" sx={{ display: 'block', opacity: 0.7, fontWeight: 600 }}>
                            {t('jury.category_weight')}: {category.weight}%
                        </Typography>
                    </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                        {category.criteria.map((criteria: any, index: number) => (
                            <Grid size={{xs:12}} key={criteria.id}>
                                <Box sx={{
                                    display: "flex",
                                    gap: 3,
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    flexWrap: "wrap",
                                    py: 1
                                }}>
                                    <Typography variant="body1" sx={{ flex: 1, fontWeight: 500 }}>
                                        {criteria.text}
                                    </Typography>
                                    <TextField
                                        type="number"
                                        placeholder="0"
                                        size="small"
                                        value={scores[criteria.id] ?? ""}
                                        onChange={(e) => onScoreChange(criteria.id, e.target.value)}
                                        disabled={disabled}
                                        InputProps={{
                                            endAdornment: <InputAdornment position="end">/ 100</InputAdornment>,
                                            sx: { borderRadius: '10px', fontWeight: 700 }
                                        }}
                                        sx={{ width: "130px" }}
                                    />
                                </Box>
                                {index < category.criteria.length - 1 && <Divider sx={{ mt: 2, opacity: 0.5 }} />}
                            </Grid>
                        ))}
                    </Grid>
                </AccordionDetails>
            </Accordion>
        ))}
    </>
);