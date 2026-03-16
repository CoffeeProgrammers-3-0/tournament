<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('password','password-confirm'); section>

    <#if section = "form">
        <style>
            .form-header h2 {
                margin-block-start: 0;
                margin-block-end: 15px;
                font-size: 42px;
                text-align: center;
            }

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
                z-index: 2;
            }

            .toggle-password:hover {
                color: var(--color-primary);
            }

            .mui-input.input-error {
                border-color: var(--color-danger) !important;
                background-color: #fff8f8;
            }

            .error-message {
                color: var(--color-danger);
                font-size: 12px;
                font-weight: 500;
                margin-top: 6px;
                display: block;
            }

            .btn-update {
                width: 100%;
                background: var(--color-primary);
                color: white;
                border: none;
                padding: 14px;
                border-radius: 999px;
                font-weight: 700;
                font-size: 16px;
                cursor: pointer;
                margin-top: 10px;
            }
        </style>

        <div class="form-header">
            <h2>${msg("updatePasswordTitle")}</h2>
        </div>

        <form id="kc-passwd-update-form" action="${url.loginAction}" method="post">
            <input type="text" id="username" name="username" value="${username}" style="display:none;" autocomplete="username" />
            <input type="password" id="password" name="password" style="display:none;" autocomplete="current-password" />

            <div class="form-group">
                <label for="password-new" class="input-label">${msg("passwordNew")}</label>
                <div class="password-wrapper">
                    <input id="password-new"
                           class="mui-input <#if messagesPerField.existsError('password')>input-error</#if>"
                           name="password-new"
                           type="password"
                           autofocus
                           autocomplete="new-password" />
                    <button type="button" class="toggle-password" data-target="password-new" tabindex="-1">
                        <svg class="eye-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </button>
                </div>

                <#if messagesPerField.existsError('password')>
                    <span class="error-message">
                        ${kcSanitize(messagesPerField.get('password'))?no_esc}
                    </span>
                </#if>
            </div>

            <div class="form-group">
                <label for="password-confirm" class="input-label">${msg("passwordConfirm")}</label>
                <div class="password-wrapper">
                    <input id="password-confirm"
                           class="mui-input <#if messagesPerField.existsError('password-confirm')>input-error</#if>"
                           name="password-confirm"
                           type="password"
                           autocomplete="new-password" />
                    <button type="button" class="toggle-password" data-target="password-confirm" tabindex="-1">
                        <svg class="eye-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </button>
                </div>

                <#if messagesPerField.existsError('password-confirm')>
                    <span class="error-message">
                        ${kcSanitize(messagesPerField.get('password-confirm'))?no_esc}
                    </span>
                </#if>
            </div>

            <button class="btn-update" type="submit">${msg("doSubmit")}</button>
        </form>

        <script>
            document.addEventListener('DOMContentLoaded', function() {
                const toggles = document.querySelectorAll('.toggle-password');

                const eyeOpen = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
                const eyeClosed = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';

                toggles.forEach(btn => {
                    btn.addEventListener('click', function() {
                        const targetId = this.getAttribute('data-target');
                        const input = document.getElementById(targetId);
                        const icon = this.querySelector('.eye-icon');

                        if (input.type === 'password') {
                            input.type = 'text';
                            icon.innerHTML = eyeClosed;
                        } else {
                            input.type = 'password';
                            icon.innerHTML = eyeOpen;
                        }
                    });
                });
            });
        </script>
    </#if>
</@layout.registrationLayout>