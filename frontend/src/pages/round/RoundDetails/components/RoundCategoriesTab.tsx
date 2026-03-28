import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    Grid,
    IconButton,
    Typography
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import type {CategoryResponseDto} from "../../../../entities/category/category.dto";
import {ErrorMessages} from "../../../../components/main/ErrorMessages.tsx";

type Props = {
    tabValue: number;
    categories: CategoryResponseDto[];
    loadingTab: boolean;
    isAdmin: boolean;
    onOpenCategoryModal: () => void;
    onDeleteCategory: (categoryId: number) => void;
    onOpenCriteriaModal: (categoryId: number) => void;
    onDeleteCriteria: (categoryId: number, criteriaId: number) => void;
    t: (key: string, options?: any) => string;
    errors: string[];
};

export const RoundCategoriesTab = ({
                                       tabValue, categories, loadingTab, isAdmin,
                                       onOpenCategoryModal, onDeleteCategory, onOpenCriteriaModal, onDeleteCriteria, t, errors
                                   }: Props) => {
    if (tabValue !== 1) return null;

    return (
        <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3, alignItems: "center" }}>
                <Typography variant="h5" fontWeight={700}>{t("round_details.tabs.categories")}</Typography>
                <ErrorMessages errors={errors}/>
                {isAdmin && (
                    <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={onOpenCategoryModal}>
                        {t("round_details.categories.add_category")}
                    </Button>
                )}
            </Box>

            {loadingTab ? (
                <CircularProgress sx={{ display: "block", mx: "auto", my: 4 }} />
            ) : (
                <Grid container spacing={3}>
                    {categories.map((cat) => (
                        <Grid size={{ xs: 12, md: 6 }} key={cat.id}>
                            <Card variant="outlined" sx={{ borderRadius: "16px", borderColor: "#e0e0e0" }}>
                                <CardContent>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                                        <Box>
                                            <Typography variant="h6" fontWeight={700}>{cat.title}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {t("round_details.categories.weight")} <b>{cat.weight}</b>
                                            </Typography>
                                        </Box>
                                        {isAdmin && (
                                            <IconButton size="small" color="error" onClick={() => onDeleteCategory(cat.id)}>
                                                <DeleteOutlineIcon fontSize="small" />
                                            </IconButton>
                                        )}
                                    </Box>

                                    <Divider sx={{ mb: 2 }} />

                                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                                        {cat.criteria?.map((crit) => (
                                            <Chip
                                                key={crit.id}
                                                label={crit.text}
                                                variant="filled"
                                                size="small"
                                                onDelete={isAdmin ? () => onDeleteCriteria(cat.id, crit.id) : undefined}
                                                sx={{ bgcolor: "grey.200", fontWeight: 500 }}
                                            />
                                        ))}
                                        {isAdmin && (
                                            <Chip
                                                icon={<AddIcon fontSize="small" />}
                                                label={t("round_details.categories.add_criteria")}
                                                variant="outlined"
                                                color="primary"
                                                size="small"
                                                onClick={() => onOpenCriteriaModal(cat.id)}
                                                sx={{ cursor: "pointer", borderStyle: "dashed" }}
                                            />
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};