<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('username','password'); section>

    <#if section = "form">
        <style>
            .form-header h2 { margin-block-start: 0; margin-block-end: 15px; font-size: 42px; text-align: center; }
            .form-group { text-align: left; margin-bottom: 16px; width: 100%; }
            .input-label { display: block; font-weight: 600; font-size: 14px; margin-bottom: 8px; color: var(--color-text); }

            .mui-input {
                width: 100%;
                box-sizing: border-box;
                padding: 14px 16px;
                border-radius: var(--radius-md);
                border: 1px solid #d1d5db;
                font-family: inherit;
                font-size: 16px;
                background: #f8fafb;
                transition: 0.2s;
            }
            .mui-input:focus { outline: none; border-color: var(--color-primary); background: #fff; }

            .password-wrapper {
                position: relative;
                display: flex;
                align-items: center;
            }

            .password-wrapper .mui-input {
                padding-right: 45px;
            }

            .toggle-password {
                position: absolute;
                right: 12px;
                background: none;
                border: none;
                cursor: pointer;
                color: #6b7280;
                padding: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: color 0.2s;
            }

            .toggle-password:hover {
                color: var(--color-primary);
            }

            .mui-input.input-error { border-color: var(--color-danger) !important; background-color: #fff8f8; }
            .error-message { color: var(--color-danger); font-size: 12px; font-weight: 500; margin-top: 6px; display: block; }
            .btn-signin { width: 100%; background: var(--color-primary); color: white; border: none; padding: 14px; border-radius: 999px; font-weight: 700; font-size: 16px; cursor: pointer; margin-top: 6px; }
        </style>

        <div class="form-header">
            <h2>${msg("loginAccountTitle")}</h2>
        </div>

        <form id="kc-form-login" action="${url.loginAction}" method="post">
            <div class="form-group">
                <label for="username" class="input-label">
                    <#if !realm.loginWithEmailAllowed>${msg("username")}<#elseif !realm.registrationEmailAsUsername>${msg("usernameOrEmail")}<#else>${msg("email")}</#if>
                </label>
                <input id="username"
                       class="mui-input <#if messagesPerField.existsError('username','password')>input-error</#if>"
                       name="username"
                       value="${(login.username!'')}"
                       type="text"
                       autofocus
                       autocomplete="username" />

                <#if messagesPerField.existsError('username','password')>
                    <span class="error-message">
                        ${kcSanitize(messagesPerField.getFirstError('username','password'))?no_esc}
                    </span>
                </#if>
            </div>

            <div class="form-group">
                <label for="password" class="input-label">${msg("password")}</label>
                <div class="password-wrapper">
                    <input id="password"
                           class="mui-input <#if messagesPerField.existsError('username','password')>input-error</#if>"
                           name="password"
                           type="password"
                           autocomplete="current-password" />

                    <button type="button" id="togglePassword" class="toggle-password" tabindex="-1">
                        <svg id="eyeIcon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </button>
                </div>
            </div>

            <div class="options-row">
                <#if realm.rememberMe && !usernameHidden??>
                    <input id="rememberMe" name="rememberMe" type="checkbox" <#if login.rememberMe??>checked</#if>>
                    <label for="rememberMe" style="cursor: pointer;">${msg("rememberMe")}</label>
                </#if>
            </div>

            <button class="btn-signin" type="submit">${msg("doLogIn")}</button>
        </form>

        <script>
            document.addEventListener('DOMContentLoaded', function() {
                const passwordInput = document.querySelector('#password');
                const toggleButton = document.querySelector('#togglePassword');
                const eyeIcon = document.querySelector('#eyeIcon');

                toggleButton.addEventListener('click', function() {
                    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                    passwordInput.setAttribute('type', type);

                    if (type === 'text') {
                        eyeIcon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
                    } else {
                        eyeIcon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
                    }
                });
            });
        </script>
    </#if>
</@layout.registrationLayout>