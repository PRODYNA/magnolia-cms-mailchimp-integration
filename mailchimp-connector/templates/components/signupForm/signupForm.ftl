[#if content.listSubscribeUrl?has_content]
    [#--    TODO remove hardcoded iframe properties --]
    <div class="mailchimp-signup-form-container">
        <iframe src="${content.listSubscribeUrl}" width="700" height="700"></iframe>
    </div>
[#else]
    [#if cmsfn.editMode]
        <div class="editor-warning-note">
            <b>--- Failed to locate list and/or list form subscribe URL ---</b>
        </div>
    [/#if]
[/#if]
