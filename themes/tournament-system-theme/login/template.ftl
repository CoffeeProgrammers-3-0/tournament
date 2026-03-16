<#macro registrationLayout bodyClass="" displayInfo=false displayMessage=true displayRequiredFields=false>
<!DOCTYPE html>
<html lang="${locale.currentLanguageTag}">
<head>
    <link rel="preconnect" href="https://rsms.me/">
    <link rel="stylesheet" href="https://rsms.me/inter/inter.css">
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${msg("loginTitle", (realm.displayName!''))}</title>

    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

    <style>
        :root {
            --color-primary: #0e3f57;
            --color-secondary: #ffc400;
            --color-bg: #f4f6f5;
            --color-surface: #ffffff;
            --color-text: #1c1c1c;
            --color-muted: #6b7280;
            --color-danger: #c62828;
            --radius-md: 12px;
            --radius-lg: 20px;
            --shadow-sm: 0 4px 12px rgba(0,0,0,0.06);
        }

        body {
            font-family: Inter, system-ui, sans-serif;
            margin: 0;
            display: flex;
            flex-direction: column;
            min-height: 100vh;
            background-color: var(--color-bg);
            color: var(--color-text);
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 24px;
        }

        .kc-feedback {
            text-align: center;
            line-height: 1.4;
            margin-bottom: 24px;
            font-size: 16px;
        }
        .kc-feedback.feedback-error { color: var(--color-danger); font-weight: 500; }
        .kc-feedback.feedback-info { color: var(--color-muted); }
        .kc-feedback.feedback-success { color: #2e7d32; }
        .kc-feedback.feedback-warning { color: #ed6c02; }

        .app-header {
            background-color: var(--color-surface);
            border-bottom: 1px solid #e0e0e0;
            position: sticky;
            top: 0;
            z-index: 1000;
        }
        .toolbar {
            display: flex;
            align-items: center;
            line-height: 0.9;
            padding: 6px;
            justify-content: space-between;
        }
        .nav-link {
            font-size: 14px;
            font-weight: 500;
            color: var(--color-text);
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 4px;
            cursor: pointer;
            background: none;
            border: none;
        }
        .btn-support {
            background-color: var(--color-secondary);
            color: #000;
            padding: 10px 24px;
            font-weight: 700;
            border-radius: 8px;
            text-decoration: none;
            font-size: 14px;
            transition: opacity 0.2s;
        }
        .btn-support:hover { opacity: 0.9; }

        .dropdown-menu {
            display: none;
            position: absolute;
            top: 50px;
            background: var(--color-surface);
            border-radius: var(--radius-md);
            min-width: 200px;
            box-shadow: var(--shadow-sm);
            padding: 8px 0;
            border: 1px solid rgba(0,0,0,0.05);
        }
        .dropdown-item {
            display: flex;
            align-items: center;
            padding: 12px 16px;
            font-size: 14px;
            color: var(--color-text);
            text-decoration: none;
            gap: 12px;
        }
        .dropdown-item:hover { background-color: var(--color-bg); }

        .login-main {
            flex-grow: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
        }

        #kc-content-wrapper {
            background: var(--color-surface);
            padding: 32px;
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-sm);
            width: 100%;
            max-width: 400px;
        }

        .bottom-strip {
            background-color: var(--color-primary);
            color: white;
            padding: 12px 0;
            text-align: center;
            font-size: 12px;
            font-weight: 500;
            line-height: 2;
        }

        .bottom-strip * {
            opacity: 0.9;
        }

        @media (max-width: 768px) {
            .footer-grid { grid-template-columns: 1fr; }
            .desktop-only { display: none; }
        }

        .kc-feedback {
            text-align: center;
            line-height: 1.4;
            margin-bottom: 24px;
            font-size: 15px;
            padding: 16px;
            border-radius: var(--radius-md);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        }

        .kc-feedback.feedback-info,
        .kc-feedback.feedback-warning {
            background-color: rgba(255, 196, 0, 0.15);
            color: #856404;
            border: 1px solid rgba(255, 196, 0, 0.2);
        }

        .kc-feedback.feedback-error {
            background-color: rgba(198, 40, 40, 0.1);
            color: var(--color-danger);
            border: 1px solid rgba(198, 40, 40, 0.15);
            font-weight: 500;
        }

        .kc-feedback-text {
            flex: 1;
        }

        .feedback-icon {
            font-size: 20px;
            opacity: 0.8;
        }
    </style>
</head>

<body>
    <header class="app-header">
        <div class="container">
            <div class="toolbar">
                <div style="flex: 1;">
                    <img src="${url.resourcesPath}/img/logo.png" alt="Star for Life" class="footer-logo" style="margin-bottom: 0; height: 50px;">
                </div>

                <div style="flex: 1; display: flex; justify-content: flex-end; gap: 16px; align-items: center;">
                    <a href="https://www.sflua.org/donate-1" target="_blank" class="btn-support desktop-only">${msg('support')}</a>

                    <div style="width: 1px; height: 24px; background: #eee;"></div>

                    <div style="position: relative;">
                        <button class="nav-link" style="font-weight: 700; color: var(--color-muted); text-transform: uppercase;" onclick="toggleM('lang-m')">
                                <span class="material-icons" style="font-size: 20px;">language</span>
                                ${locale.currentLanguageTag[0..1]?upper_case}
                            </button>
                        <div id="lang-m" class="dropdown-menu" style="right: 0;">
                            <#list locale.supported as l>
                                <a href="${l.url}" class="dropdown-item">${l.label}</a>
                            </#list>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </header>

    <main class="login-main">
        <div id="kc-content-wrapper">
            <#nested "header">

            <#if displayMessage && message?has_content && (message.type != 'warning' || !isAppInitiatedAction??)>
                <div class="kc-feedback feedback-${message.type}">
                    <span class="kc-feedback-text">${kcSanitize(message.summary)?no_esc}</span>
                </div>
            </#if>

            <#nested "form">
        </div>
    </main>

    <footer class="app-footer">
        <div class="bottom-strip">
            <span>${msg('bottomStripText')}</span>
        </div>
    </footer>

    <script>
        function toggleM(id) {
            event.stopPropagation();
            const m = document.getElementById(id);
            const wasVisible = m.style.display === 'block';
            document.querySelectorAll('.dropdown-menu').forEach(el => el.style.display = 'none');
            m.style.display = wasVisible ? 'none' : 'block';
        }
        window.onclick = () => document.querySelectorAll('.dropdown-menu').forEach(el => el.style.display = 'none');
    </script>
</body>
</html>
</#macro>