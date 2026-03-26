import {Accordion, AccordionDetails, AccordionSummary, Box, Divider, Grid, TextField, Typography} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export const GradingForm = ({ categories, scores, onScoreChange, disabled, t }: any) => (
    <>
        <Typography variant="h5" fontWeight={800} sx={{ mb: 3 }}>{t('jury.grading_rubric')}</Typography>
        {categories.map((category: any) => (
            <Accordion key={category.id} defaultExpanded sx={{ mb: 2, borderRadius: "16px !important", overflow: "hidden", border: "1px solid #eee", boxShadow: "none" }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: "#f8f9fa" }}>
                    <Box>
                        <Typography variant="h6" fontWeight={700}>{category.title}</Typography>
                        <Typography variant="caption" color="text.secondary">{t('jury.category_weight')}: {category.weight}%</Typography>
                    </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                        {category.criteria.map((criteria: any) => (
                            <Grid size={{xs: 12}} key={criteria.id}>
                                <Box sx={{ display: "flex", gap: 3, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
                                    <Typography variant="body1" sx={{ flex: 1, minWidth: "200px" }}>{criteria.text}</Typography>
                                    <TextField
                                        type="number" label={t('jury.score_0_100')} size="small"
                                        value={scores[criteria.id] ?? ""}
                                        onChange={(e) => onScoreChange(criteria.id, e.target.value)}
                                        disabled={disabled}
                                        inputProps={{ min: 0, max: 100 }}
                                        sx={{ width: "120px" }}
                                    />
                                </Box>
                                <Divider sx={{ mt: 2 }} />
                            </Grid>
                        ))}
                    </Grid>
                </AccordionDetails>
            </Accordion>
        ))}
    </>
);