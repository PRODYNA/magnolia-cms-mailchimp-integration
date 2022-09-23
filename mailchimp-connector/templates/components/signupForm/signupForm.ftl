[#if content.listSubscribeUrl?has_content]
    [#--    TODO remove hardcoded iframe properties --]
    <div class="mailchimp-signup-form-container">
        <iframe src="${content.listSubscribeUrl}" width="700" height="700" style="text-align: center; display: block; margin: 0 auto; border-style: none;"></iframe>
    </div>
[#else]
    [#if cmsfn.editMode]
        <div class="editor-warning-note">
            <strong>${i18n.get("signupForm.content.editor.warning")}</strong>
        </div>
    [/#if]
[/#if]
