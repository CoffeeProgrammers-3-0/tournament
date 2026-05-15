<#import "template.ftl" as layout>
<@layout.registrationLayout displayInfo=true displayMessage=!messagesPerField.existsError('username'); section>

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

            .mui-input.input-error { border-color: var(--color-danger) !important; background-color: #fff8f8; }
            .error-message { color: var(--color-danger); font-size: 12px; font-weight: 500; margin-top: 6px; display: block; }

            .btn-submit {
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

            .back-to-login {
                text-align: center;
                margin-top: 20px;
                font-size: 14px;
            }

            .back-to-login a {
                color: var(--color-primary);
                text-decoration: none;
                font-weight: 600;
            }

            .back-to-login a:hover {
                text-decoration: underline;
            }
        </style>

        <div class="form-header">
            <h2>${msg("emailForgotTitle")}</h2>
        </div>

        <form id="kc-reset-password-form" action="${url.loginAction}" method="post">
            <div class="form-group">
                <label for="username" class="input-label">
                    <#if !realm.loginWithEmailAllowed>${msg("username")}<#elseif !realm.registrationEmailAsUsername>${msg("usernameOrEmail")}<#else>${msg("email")}</#if>
                </label>
                <input id="username"
                       class="mui-input <#if messagesPerField.existsError('username')>input-error</#if>"
                       name="username"
                       type="text"
                       autofocus
                       value="${(auth.attemptedUsername!'')}"
                       autocomplete="username" />

                <#if messagesPerField.existsError('username')>
                    <span class="error-message">
                        ${kcSanitize(messagesPerField.get('username'))?no_esc}
                    </span>
                </#if>
            </div>

            <button class="btn-submit" type="submit">${msg("doSubmit")}</button>

            <div class="back-to-login">
                <a href="${url.loginUrl}">${kcSanitize(msg("backToLogin"))?no_esc}</a>
            </div>
        </form>

    <#elseif section = "info">
        <div style="text-align: center; font-size: 14px; color: #6b7280; margin-top: 16px; line-height: 1.5;">
            ${msg("emailInstruction")}
        </div>
    </#if>

</@layout.registrationLayout>