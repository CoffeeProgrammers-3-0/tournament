import {
    Autocomplete,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField
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
};

export const JuryDialog = ({
                               open, onClose, availableJuries, selectedJury, setSelectedJury,
                               onSubmit, t, inputValue, onInputChange, loading
                           }: Props) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 700 }}>{t("round_details.admin.jury_modal.title")}</DialogTitle>
            <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2, overflowY: "visible" }}>
                <Autocomplete
                    options={availableJuries}
                    getOptionLabel={(option) => `${option.fullName} (${option.email})`}
                    filterOptions={(x) => x} // Важливо: вимикаємо вбудовану фільтрацію MUI, бо ми фільтруємо на сервері
                    value={selectedJury}
                    loading={loading}
                    onChange={(_, newValue) => setSelectedJury(newValue)}
                    inputValue={inputValue}
                    onInputChange={(_, newInputValue) => onInputChange(newInputValue)}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label={t("round_details.admin.jury_modal.select")}
                            fullWidth
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                    <>
                                        {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                        {params.InputProps.endAdornment}
                                    </>
                                ),
                            }}
                        />
                    )}
                    noOptionsText={loading ? t("common.loading") : t("common.no_options")}
                />
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={onClose} color="inherit">{t("round_details.admin.cancel")}</Button>
                <Button variant="contained" onClick={onSubmit} sx={{ fontWeight: 700 }} disabled={!selectedJury}>
                    {t("round_details.admin.jury_modal.submit")}
                </Button>
            </DialogActions>
        </Dialog>
    );
};