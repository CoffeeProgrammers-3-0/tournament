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
    tournaments: {
        "title": "Tournaments",
        "admin_title": "Tournament Management",
        "subtitle": "Track your results and discover new challenges.",
        "search_placeholder": "Search by name...",
        "no_data": "No tournaments found",
        "tabs": {
            "available": "Available",
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
        header: {
            startDate: "Starts:",
            registered: "You are registered",
            register_btn: "Register Now"
        },
        tabs: {
            info: "Information",
            rounds: "Rounds",
            teams: "Teams"
        },
        info: {
            reg_period: "Registration Period",
            max_teams: "Max Teams Capacity",
            rounds_count: "Number of Rounds",
            no_description: "No description provided for this tournament."
        },
        rounds: {
            title: "Tournament Rounds",
            empty: "No rounds have been created for this tournament yet."
        },
        teams: {
            empty: "No teams have registered for this tournament yet."
        },
        admin: {
            edit_info: "Edit Tournament",
            add_round: "Add New Round",
            create_modal: {
                title: "Create New Round",
                name: "Round Name",
                name_placeholder: "Describe the tasks for participants in this stage...",
                start: "Start Date",
                end: "End Date",
                winners: "Teams advancing count",
                task: "Task Description",
                submit: "Create Round"
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
    jury: {
        "submissions_title": "Pending Reviews",
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
        "criteria": "Evaluation Criteria"
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
    common: {
        "save": "Save",
        "cancel": "Cancel",
        "loading": "Loading...",
        "error": "An error occurred",
        "success": "Action successful",
        "back": "Back",
        "authenticating": "Authenticating",
        "authenticatingSubtitle": "Please, wait"
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
};