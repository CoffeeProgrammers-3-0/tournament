import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    List,
    ListItemButton,
    ListItemText,
    Pagination,
    TextField,
    Typography
} from "@mui/material";
import type {UserResponseDto} from "../../../../entities/user/user.dto";

type Props = {
    open: boolean;
    onClose: () => void;
    availableJuries: UserResponseDto[];
    selectedJury: UserResponseDto | null;
    setSelectedJury: React.Dispatch<React.SetStateAction<UserResponseDto | null>>;
    onSubmit: () => Promise<void>;
    t: (key: string, options?: any) => string;
    inputValue: string;
    onInputChange: (value: string) => void;
    loading: boolean;
    page: number;
    totalPages: number;
    onPageChange: (event: React.ChangeEvent<unknown>, value: number) => void;
    disabledIds?: number[];
};

export const JuryDialog = ({
                               open, onClose, availableJuries, selectedJury, setSelectedJury,
                               onSubmit, t, inputValue, onInputChange, loading,
                               page, totalPages, onPageChange, disabledIds = []
                           }: Props) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 700 }}>{t("round_details.admin.jury_modal.title")}</DialogTitle>

            <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2, minHeight: 400 }}>
                {/* Поле пошуку */}
                <TextField
                    label={t("common.search")}
                    variant="outlined"
                    fullWidth
                    value={inputValue}
                    onChange={(e) => onInputChange(e.target.value)}
                    InputProps={{
                        endAdornment: loading ? <CircularProgress color="inherit" size={20} /> : null,
                    }}
                />

                {/* Список журі */}
                <Box sx={{ flexGrow: 1, overflowY: "auto", border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    {loading && availableJuries.length === 0 ? (
                        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                            <CircularProgress />
                        </Box>
                    ) : availableJuries.length === 0 ? (
                        <Box display="flex" justifyContent="center" alignItems="center" height="100%" p={2}>
                            <Typography color="textSecondary">{t("common.no_options")}</Typography>
                        </Box>
                    ) : (
                        <List disablePadding>
                            {availableJuries.map((user) => {
                                const isDisabled = disabledIds.includes(user.id);
                                return (
                                    <ListItemButton
                                        key={user.id}
                                        selected={selectedJury?.id === user.id}
                                        disabled={isDisabled}
                                        onClick={() => setSelectedJury(user)}
                                        divider
                                    >
                                        <ListItemText
                                            primary={user.fullName}
                                            secondary={user.email}
                                            primaryTypographyProps={{
                                                color: isDisabled ? 'textSecondary' : 'textPrimary'
                                            }}
                                        />
                                    </ListItemButton>
                                );
                            })}
                        </List>
                    )}
                </Box>

                {/* Пагінація */}
                {totalPages > 1 && (
                    <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={onPageChange}
                            color="primary"
                            disabled={loading}
                        />
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 3 }}>
                <Button onClick={onClose} color="inherit">{t("round_details.admin.cancel")}</Button>
                <Button variant="contained" onClick={onSubmit} sx={{ fontWeight: 700 }} disabled={!selectedJury || loading}>
                    {t("round_details.admin.jury_modal.submit")}
                </Button>
            </DialogActions>
        </Dialog>
    );
};