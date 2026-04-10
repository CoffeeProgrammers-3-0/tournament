import {useRef, useState} from "react";
import {Autocomplete, Box, CircularProgress, Divider, Grid, IconButton, TextField, Typography} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import {useTranslation} from "react-i18next";
import {userService} from "../../../../services/impl/UserService.ts";

interface Props {
    users: any[];
    onChange: (idx: number, field: string, value: string) => void;
    onAdd: () => void;
    onRemove: (idx: number) => void;
    limits: { min: number, max: number };
    isReadOnlyFirst?: boolean;
}

export const TeamMembersForm = ({ users, onChange, onAdd, onRemove, limits, isReadOnlyFirst }: Props) => {
    const { t } = useTranslation();

    // Стан для пошуку
    const [options, setOptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    //const [open, setOpen] = useState<{ [key: number]: boolean }>({});
    const debounceTimer = useRef<any>(null);

    const handleSearch = (email: string) => {
        if (email.length < 3) {
            setOptions([]);
            return;
        }

        setLoading(true);
        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        debounceTimer.current = setTimeout(async () => {
            try {
                const results = await userService.getUserByEmail(email);
                setOptions(results);
            } catch (err) {
                console.error("Search error", err);
            } finally {
                setLoading(false);
            }
        }, 500); // Затримка 500мс
    };

    return (
        <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mt: 3, mb: 1 }}>
                    {t("team_create.team_members")}
                </Typography>
                <Divider />
            </Grid>

            {users.map((user, idx) => (
                <Grid size={{ xs: 12 }} key={idx}>
                    <Box sx={{
                        display: "flex", gap: 2,
                        flexDirection: { xs: "column", sm: "row" },
                        p: 2, borderRadius: "16px",
                        bgcolor: idx === 0 ? "rgba(0,0,0,0.03)" : "transparent"
                    }}>
                        <TextField
                            label={idx === 0 ? t("team_create.fields.leaders_name") : t("team_create.fields.members_name")}
                            fullWidth required
                            disabled={idx === 0 && isReadOnlyFirst}
                            value={user.fullName}
                            onChange={e => onChange(idx, "fullName", e.target.value)}
                        />

                        {/* Пошук по Email через Autocomplete */}
                        <Autocomplete
                            fullWidth
                            freeSolo // Дозволяє вводити довільний текст, якщо юзера не знайдено
                            options={options}
                            getOptionLabel={(option) => typeof option === 'string' ? option : option.email}
                            loading={loading}
                            disabled={idx === 0 && isReadOnlyFirst}
                            onInputChange={(_, value) => {
                                onChange(idx, "email", value);
                                handleSearch(value);
                            }}
                            onChange={(_, newValue: any) => {
                                if (newValue && typeof newValue !== 'string') {
                                    // Якщо обрали юзера зі списку - заповнюємо обидва поля
                                    onChange(idx, "email", newValue.email);
                                    onChange(idx, "fullName", newValue.fullName);
                                }
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label={idx === 0 ? t("team_create.fields.leaders_email") : t("team_create.fields.members_email")}
                                    required
                                    type="email"
                                    slotProps={{
                                        input: {
                                            ...params.InputProps,
                                            endAdornment: (
                                                <>
                                                    {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                                    {params.InputProps.endAdornment}
                                                </>
                                            ),
                                        },
                                    }}
                                />
                            )}
                            renderOption={(props, option) => (
                                <li {...props}>
                                    <Box>
                                        <Typography variant="body1">{option.fullName}</Typography>
                                        <Typography variant="caption" color="text.secondary">{option.email}</Typography>
                                    </Box>
                                </li>
                            )}
                        />

                        <Box sx={{ display: "flex", alignSelf: "center" }}>
                            <IconButton
                                color="error"
                                onClick={() => onRemove(idx)}
                                disabled={users.length <= limits.min || idx === 0}
                            >
                                <RemoveIcon />
                            </IconButton>
                            {idx === users.length - 1 && (
                                <IconButton
                                    color="primary"
                                    onClick={onAdd}
                                    disabled={users.length >= limits.max}
                                >
                                    <AddIcon />
                                </IconButton>
                            )}
                        </Box>
                    </Box>
                </Grid>
            ))}
        </Grid>
    );
};