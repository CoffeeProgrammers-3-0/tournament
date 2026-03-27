export const en = {
    header: {
        "tournaments": "Tournaments",
        "teams": "Teams",
        "support": "Support",
        "availableTournaments": "Available",
        "myCurrentTournaments": "My Active",
        "history": "History",
        "profile": "Profile",
        "logout": "Logout",
        "login": "Login",
        "manageTournaments": "Manage Tournaments",
        "allTeams": "All Teams",
        "adminPanel": "Admin Panel",
        "mySubmissions": "Review Submissions",
        "myTeam": "My Team",
        "role": "Role: ",
    },
    footer: {
        "description": "Digital platform for hackathons and competitions by Star for Life Ukraine charity foundation.",
        "tournaments": "Tournaments",
        "available": "Available",
        "myTournaments": "My Participation",
        "teams": "Teams",
        "myTeams": "My Teams",
        "contacts": "Contacts",
        "founded": "Founded: 30.01.2023",
        "rights": "All rights reserved",
        "terms": "Terms of Use",
        "privacy": "Privacy Policy",
        "register": "ID: 44977372"
    },

    languages: {
        en: "English",
        uk: "Ukrainian",
    },
    common: {
        "save": "Save",
        "saving": "Saving...",
        "cancel": "Cancel",
        "loading": "Loading...",
        "error": "An error occurred",
        "success": "Action successful",
        "back": "Back",
        "authenticating": "Authenticating",
        "authenticatingSubtitle": "Please, wait",
        "edit": "Edit",
        "delete": "Delete",
        "add": "Add",
        "no_options": "No options available",
        "confirm_promote": "Confirm promotion to leader",
        "yes_confirm": "Confirm",
        "no": "Cancel",
    },

    home: {
        "title": "Manage Tournaments Easily",
        "description": "A single platform for organizing competitions, managing teams, and transparent real-time scoring.",
        "how_it_works": {
            "title": "How it works?",
            "steps": {
                "step1": {
                    "title": "Registration",
                    "desc": "Create your profile and get access to the list of current tournaments in your region or online."
                },
                "step2": {
                    "title": "Team Formation",
                    "desc": "Find like-minded people, create your own team, or join an existing one to participate in competitions."
                },
                "step3": {
                    "title": "Path to Victory",
                    "desc": "Complete round tasks, get scores from professional jury, and climb to the top of the leaderboard."
                }
            }
        }
    },

    profile: {
        "title": "My Profile",
        "role": "System Role",
        "teams": "My Teams",
        "tournaments": "Active Tournaments",
        "no_teams": "You haven't joined any teams yet",
        "no_tournaments": "No active tournaments at the moment",
        "error_loading": "Failed to load profile data",
        "buttons": {
            "edit": "Edit Profile"
        },
        "fields": {
            "full_name": "Full Name",
        },
        "statuses": {
            "RUNNING": "Running",
            "COMPLETED": "Completed",
            "REGISTRATION": "Registration"
        }
    },

    tournaments: {
        "title": "Tournaments",
        "admin_title": "Tournament Management",
        "subtitle": "Track your results and discover new challenges.",
        "search_placeholder": "Search by name...",
        "no_data": "No tournaments found",
        "tabs": {
            "available": "Available",
            "my_registed": "I`m registered on",
            "my": "My Entries",
            "history": "Past",
            "admin": "Management"
        },
        "card": {
            "more_info": "View Details",
            "no_data": "No tournaments in this category yet."
        },
        "statuses": {
            "REGISTRATION": "Registration",
            "RUNNING": "Ongoing",
            "FINISHED": "Finished",
            "DRAFT": "Draft"
        },
        "admin": {
            "create_button": "Create Tournament",
            "modal_title": "New Tournament",
            "submit": "Create",
            "cancel": "Cancel",
            "backToList": "Back to List",
            "fields": {
                "name": "Tournament Name",
                "description": "Description",
                "startTournament": "Start Date",
                "startReg": "Registration Start",
                "endReg": "Registration End",
                "maxTeams": "Max Teams",
                "rounds": "Rounds Count"
            }
        }
    },
    tournament_details: {
        "header": {
            "startDate": "Starts:",
            "registered": "You are registered",
            "register_btn": "Register Now"
        },
        "tabs": {
            "info": "Information",
            "rounds": "Rounds",
            "teams": "Teams"
        },
        "info": {
            "reg_period": "Registration Period",
            "max_teams": "Max Members of Team Capacity",
            "rounds_count": "Number of Rounds",
            "no_description": "No description provided for this tournament."
        },
        "rounds": {
            "title": "Tournament Rounds",
            "empty": "No rounds have been created for this tournament yet."
        },
        "teams": {
            "empty": "No teams have registered for this tournament yet."
        },
        "admin": {
            "edit_info": "Edit Tournament",
            "add_round": "Add New Round",
            "create_modal": {
                "title": "Create New Round",
                "name": "Round Name",
                "name_placeholder": "Describe the tasks for participants in this stage...",
                "start": "Start Date",
                "end": "End Date",
                "winners": "Teams advancing count",
                "task": "Task Description",
                "submit": "Create Round"
            }
        }
    },

    teams: {
        "title": "Teams",
        "admin_title": "Team Directory",
        "subtitle": "Participants and communities of the platform",
        "search_placeholder": "Search team by name...",
        "no_data": "No teams found",
        "actions": {
            "create": "Register Team"
        },
        "card": {
            "more_info": "View Profile"
        }
    },
    team_create: {
        "title": "Team Registration",
        "subtitle": "Fill in the details to participate in the tournament",
        "back": "Back to tournament",
        "success": "Team successfully registered!",
        "registration": "Registering...",
        "regis": "Register Team",
        "team_members": "Team Members",
        "fields": {
            "name": "Team Name",
            "contact_email": "Contact Email",
            "org_name": "Organization / University",
            "contact_some": "Phone or Telegram",
            "leaders_name": "Leader's Full Name",
            "leaders_email": "Leader's Email",
            "members_name": "Member",
            "members_email": "Member`s email"
        },
        "errors": {
            "choose_tournament": "Tournament ID is missing. Please return and try again.",
            "name_needed": "Please enter a team name.",
            "email_needed": "Contact email is required.",
            "users_incomplete": "Please fill in all member details.",
            "min_members": "A team must have at least one member.",
            "error": "Failed to create team. Please try again."
        }
    },
    team_details: {
        "status": {
            "locked_started": "Roster locked: Tournament has started"
        },
        "reasons": {
            "TOURNAMENT_STARTED": "You cannot change members after the tournament starts.",
            "NOT_LEADER": "Only the team leader can manage members.",
            "NOT_FOUND": "Participation data not found."
        },
        "not_found": "Team not found",
        "tabs": {
            "info": "Information",
            "members": "Members",
            "tournaments": "Tournaments"
        },
        "info": {
            "team_name": "Team Name",
            "org_name": "Organization / Institution",
            "contact_person": "Contact Person",
            "email": "Contact Email"
        },
        "members": {
            "title": "Team Roster"
        },
        "tournaments": {
            "title": "Tournament History",
            "coming_soon": "Tournament list will be available soon."
        },
        "admin": {
            "edit_info": "Edit Details",
            "save": "Save Changes",
            "cancel": "Cancel",
            "add_member": "Add Member",
            "delete_confirm": "Are you sure you want to delete this team?",
            "delete_member_confirm": "Are you sure you want to remove this member from the team?",
            "make_leader": "Promote to Leader",
            "remove_member": "Remove from team",
            "member_modal": {
                "title": "New Member",
                "full_name": "Full Name",
                "email": "Email Address",
                "is_leader": "Set as Leader",
                "submit": "Add to Roster"
            }
        },
        "errors": {
            "fetch_failed": "Failed to load team details",
            "update_failed": "Error updating information",
            "add_member_failed": "Failed to add member",
            "remove_member_failed": "Error removing member",
            "promote_failed": "Failed to change leader"
        },
        "confirm.promote_text": "Promote to leader member",
    },

    jury: {
        "submissions_title": "Pending Reviews",
        "submissions_subtitle": "Please check the projects submitted by the teams",
        "evaluate_title": "Project Evaluation",
        "team": "Team",
        "links": "Materials",
        "no_submissions": "No projects to review at the moment",
        "evaluation_form": {
            "score": "Score",
            "comment": "Comment for the team",
            "placeholder_comment": "Your notes or advice...",
            "submit": "Complete Evaluation",
            "success": "Score submitted!"
        },
        "criteria": "Evaluation Criteria",
        "actions": {
            "evaluate": "Evaluate",
            "save_scores": "Save Scores",
        },
        "round_label": "Round",
        "view_github": "Link to github",
        "view_video": "Link to YouTube/Google disk",
        "submission_desc": "Project Description",
        "grading_rubric": "Grading Rubric",
        "category_weight": "Weight",
        "score_0_100": "Score 0-100",
        "no_categories": "No categories available",
    },
    juries: {
        "management_title": "Management of Jury",
        "management_subtitle": "Page for management all juries",
        "tabs": {
            "list": "List",
            "create": "Create"
        },
        "search_placeholder": "Search",
        "delete_confirm": "Are you sure you want to delete this jury member?",
    },
    create_jury: {
        "title": "New Jury",
        "subtitle": "Fill in the details to add a new jury member to the system",
        "success": "Jury member created successfully!",
        "fields": {
            "full_name": "Full Name",
            "email": "Email Address"
        },
        "actions": {
            "submit": "Create Jury",
            "creating": "Creating..."
        },
        "errors": {
            "generic": "Failed to create jury. Please check the data and try again."
        }
    },

    rounds: {
        "status": "Round Status",
        "statuses": {
            "DRAFT": "Drafting",
            "ACTIVE": "Open for Submissions",
            "SUBMISSION_CLOSED": "Under Review",
            "EVALUATED": "Finished"
        }
    },
    round_details: {
        "not_found": "Round not found",
        "header": {
            "dates": "Dates:",
            "winners": "Winners:"
        },
        "tabs": {
            "info": "Information",
            "categories": "Categories",
            "jury": "Jury",
            "teams": "Teams",
            "leaderboard": "Teams(Leaderboard)",
            "submissions": "Submissions",
            "stats": "Statistics",
        },
        "info": {
            "name": "Round name",
            "status": "Status",
            "start_date": "Start",
            "end_date": "End",
            "winners_count": "Number of winners",
            "task": "Task",
            "requirements": "Requirements",
            "no_info": "No information"
        },
        "admin": {
            "edit_info": "Edit information",
            "save": "Save",
            "cancel": "Cancel",
            "category_modal": {
                "title": "Add Category",
                "name": "Category name",
                "weight": "Weight",
                "submit": "Create category"
            },
            "jury_modal": {
                "title": "Assign Jury Member",
                "id": "Enter jury ID",
                "submit": "Assign",
                "select": "Choose jury member"
            }
        },
        "categories": {
            "add_category": "Add Category",
            "add_criteria": "Add Criterion",
            "criteria_text": "Criterion Text",
            "weight": "Weight:"
        },
        "jury": {
            "assign": "Assign Jury",
            "remove": "Remove Jury"
        },
        "teams": {
            "rank": "Rank",
            "team_name": "Team name",
            "email": "Email",
            "points": "Points",
            "no_data": "No data"
        },
        "stats_modal": {
            "title": "Team stats: {{teamName}}",
            "view_aggregated": "Aggregated",
            "view_detailed": "Detailed",
            "criteria": "Criterion",
            "total": "Total",
            "total_score": "TOTAL SCORE",
            "close": "Close",
            "open": "Detailed statistics"
        },
        "common": {
            "actions": "Actions"
        },
        "submit_button": "Submit work",
        "submissions": {
            "auto_assign": "Auto assign juries for all submissions",
            "auto_assign_title": "Auto assign juries",
            "auto_assign_desc": "Enter number of juries per submission. Note: this will erase all existing jury assignments.",
        }
    },

    submission: {
        "title": "Submit Project",
        "subtitle": "Round: {{roundName}}",
        "fields": {
            "github": "GitHub / Repository Link",
            "video": "Video Presentation Link (YouTube/Drive)",
            "description": "Solution Description",
            "placeholder_desc": "Briefly describe your work..."
        },
        "status": {
            "not_submitted": "Not submitted yet",
            "submitted": "Project submitted",
            "edit": "Update Project"
        },
        "submit_btn": "Submit for Review",
        "success": "Project saved successfully!"
    },
};