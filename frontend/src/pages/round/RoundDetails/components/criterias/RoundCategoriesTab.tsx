import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    Grid,
    IconButton,
    Stack,
    Typography
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import type {CategoryResponseDto} from "../../../../../entities/category/category.dto";

type Props = {
    categories: CategoryResponseDto[];
    loadingTab: boolean;
    isAdmin: boolean;
    isReadOnly?: boolean;
    onOpenCategoryModal: () => void;
    onDeleteCategory: (categoryId: number) => void;
    onOpenCriteriaModal: (categoryId: number) => void;
    onDeleteCriteria: (categoryId: number, criteriaId: number) => void;
    t: (key: string, options?: any) => string;
};

export const RoundCategoriesTab = ({
                                       categories, loadingTab, isAdmin, isReadOnly,
                                       onOpenCategoryModal, onDeleteCategory, onOpenCriteriaModal, onDeleteCriteria, t
                                   }: Props) => {

    const canEdit = isAdmin && !isReadOnly;

    return (
        <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3, alignItems: "center" }}>
                <Typography variant="h5" fontWeight={700}>{t("round_details.tabs.categories")}</Typography>
                {canEdit && (
                    <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={onOpenCategoryModal}>
                        {t("round_details.categories.add_category")}
                    </Button>
                )}
            </Box>

            {isReadOnly && (
                <Alert severity="info" sx={{ mb: 3, borderRadius: '16px', '& .MuiAlert-message': { fontWeight: 600 } }}>
                    {t('round_details.categories.evaluated_info', 'Цей раунд завершено. Категорії та критерії доступні лише для перегляду і не можуть бути змінені.')}
                </Alert>
            )}

            {loadingTab ? (
                <CircularProgress sx={{ display: "block", mx: "auto", my: 4 }} />
            ) : (
                <Grid container spacing={3}>
                    {categories.map((cat) => (
                        <Grid size={{ xs: 12, md: 6 }} key={cat.id}>
                            <Card variant="outlined" sx={{ borderRadius: "16px", borderColor: "#e0e0e0", height: '100%' }}>
                                <CardContent>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                                        <Box>
                                            <Typography variant="h6" fontWeight={700}>{cat.title}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {t("round_details.categories.weight")} <b>{cat.weight}</b>
                                            </Typography>
                                        </Box>
                                        {canEdit && (
                                            <IconButton size="small" color="error" onClick={() => onDeleteCategory(cat.id)}>
                                                <DeleteOutlineIcon fontSize="small" />
                                            </IconButton>
                                        )}
                                    </Box>

                                    <Divider sx={{ mb: 2 }} />

                                    {/* CRITERIA LIST SECTION */}
                                    <Stack spacing={1}>
                                        {cat.criteria?.map((crit) => (
                                            <Chip
                                                key={crit.id}
                                                label={crit.text}
                                                variant="filled"
                                                onDelete={canEdit ? () => onDeleteCriteria(cat.id, crit.id) : undefined}
                                                sx={{
                                                    bgcolor: "grey.100",
                                                    fontWeight: 500,
                                                    width: '100%',
                                                    justifyContent: 'space-between', // Pushes delete icon to the right
                                                    height: 'auto',
                                                    py: 1,
                                                    '& .MuiChip-label': {
                                                        display: 'block',
                                                        whiteSpace: 'normal', // Allows text to wrap if it's long
                                                        textAlign: 'left',
                                                        width: '100%',
                                                        px: 1
                                                    }
                                                }}
                                            />
                                        ))}

                                        {canEdit && (
                                            <Chip
                                                icon={<AddIcon fontSize="small" />}
                                                label={t("round_details.categories.add_criteria")}
                                                variant="outlined"
                                                color="primary"
                                                onClick={() => onOpenCriteriaModal(cat.id)}
                                                sx={{
                                                    cursor: "pointer",
                                                    borderStyle: "dashed",
                                                    width: '100%',
                                                    justifyContent: 'center',
                                                    py: 1
                                                }}
                                            />
                                        )}
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};