import {Avatar, Box, Card, CardContent, IconButton, Tooltip, Typography} from "@mui/material";
import StarsIcon from "@mui/icons-material/Stars";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

export const MemberCard = ({ user, canControl, onPromote, onDelete }: any) => (
    <Card sx={{
        borderRadius: "16px", border: "1px solid",
        borderColor: user.isLeader ? "secondary.main" : "divider"
    }} elevation={0}>
        <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar sx={{ bgcolor: user.isLeader ? "secondary.main" : "grey.200", flexShrink: 0 }}>
                {user.fullName.charAt(0)}
            </Avatar>

            {/* Ключова зміна: minWidth: 0 дозволяє тексту стискатися всередині flex-контейнера */}
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Typography
                        variant="body1"
                        fontWeight={700}
                        sx={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                        }}
                    >
                        {user.fullName}
                    </Typography>
                    {user.isLeader && <StarsIcon fontSize="small" color="secondary" sx={{ flexShrink: 0 }} />}
                </Box>

                <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    sx={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                    }}
                >
                    {user.email}
                </Typography>
            </Box>

            {canControl && (
                <Box sx={{ display: "flex", flexShrink: 0 }}>
                    {!user.isLeader && (
                        <Tooltip title="Make Leader">
                            <IconButton size="small" color="secondary" onClick={() => onPromote(user.id)}>
                                <VerifiedUserIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                    <Tooltip title="Remove">
                        <IconButton size="small" color="error" onClick={() => onDelete(user.id)}>
                            <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            )}
        </CardContent>
    </Card>
);