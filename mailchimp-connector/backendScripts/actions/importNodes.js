loadScript("/mailchimp-connector/backendScripts/utils.js");

var ImportCampaignItems = function(items, session, rootNode, contentType) {
    let utils = new Utils();
    let nodeUtil = utils.getNodeUtil();
    let nodeTypesUtil = utils.getNodeTypes();
    let PropertyUtil = utils.getPropertyUtil();
    let restClient;
    try {
        restClient = utils.getRestClient("mailchimpRestClient");
        items.forEach(entity => {
            if (session.nodeExists("/" + entity.id)) {
                session.getItem("/" + entity.id).remove();
            }

            let campaignNode = nodeUtil.createPath(rootNode, entity.id, contentType);
            PropertyUtil.setProperty(campaignNode, "id", entity.id);
            PropertyUtil.setProperty(campaignNode, "type", entity.type);
            PropertyUtil.setProperty(campaignNode, "status", entity.status);

            let recipientsNode = nodeUtil.createPath(campaignNode, "recipients", "mgnl:contentNode");
            PropertyUtil.setProperty(recipientsNode, "list_id", entity.recipients.list_id);

            let settingsNode = nodeUtil.createPath(campaignNode, "settings", "mgnl:contentNode");
            PropertyUtil.setProperty(settingsNode, "title", entity.settings.title);
            PropertyUtil.setProperty(settingsNode, "subject_line", entity.settings.subject_line);
            PropertyUtil.setProperty(settingsNode, "from_name", entity.settings.from_name);
            PropertyUtil.setProperty(settingsNode, "to_name", entity.settings.to_name);
            PropertyUtil.setProperty(settingsNode, "reply_to", entity.settings.reply_to);

            let res = restClient.invoke("getContent", {"id": entity.id});
            let body = JSON.parse(res.getEntity());
            if (body.html) {
                PropertyUtil.setProperty(campaignNode, "content", body.html);
            } else if (body.plain_text) {
                PropertyUtil.setProperty(campaignNode, "content", body.plain_text);
            }

            nodeTypesUtil.Activatable.update(campaignNode, "Import", true);
        });
    } finally {
        restClient.close();
    }
}

var ImportListItems = function(items, session, rootNode, contentType) {
    let utils = new Utils();
    let nodeUtil = utils.getNodeUtil();
    let nodeTypesUtil = utils.getNodeTypes();
    let PropertyUtil = utils.getPropertyUtil();
    items.forEach(entity => {
        if(session.nodeExists("/" + entity.id)) {
            session.getItem("/" + entity.id).remove();
        }
        let listNode = nodeUtil.createPath(rootNode, entity.id, contentType);
        PropertyUtil.setProperty(listNode, "id", entity.id);
        PropertyUtil.setProperty(listNode, "name", entity.name);
        PropertyUtil.setProperty(listNode, "members", entity.stats.member_count);
        PropertyUtil.setProperty(listNode, "permission_reminder", entity.permission_reminder);
        PropertyUtil.setProperty(listNode, "email_type_option", entity.email_type_option);

        let contactNode = nodeUtil.createPath(listNode, "contact", "mgnl:contentNode");
        PropertyUtil.setProperty(contactNode, "address1", entity.contact.address1);
        PropertyUtil.setProperty(contactNode, "company", entity.contact.company);
        PropertyUtil.setProperty(contactNode, "city", entity.contact.city);
        PropertyUtil.setProperty(contactNode, "country", entity.contact.country);
        PropertyUtil.setProperty(contactNode, "zip", entity.contact.zip);
        PropertyUtil.setProperty(contactNode, "state", entity.contact.state);

        let campaignDefaultsNode = nodeUtil.createPath(listNode, "campaign_defaults", "mgnl:contentNode");
        PropertyUtil.setProperty(campaignDefaultsNode, "from_name", entity.campaign_defaults.from_name);
        PropertyUtil.setProperty(campaignDefaultsNode, "from_email", entity.campaign_defaults.from_email);
        PropertyUtil.setProperty(campaignDefaultsNode, "subject", entity.campaign_defaults.subject);
        PropertyUtil.setProperty(campaignDefaultsNode, "language", entity.campaign_defaults.language);

        nodeTypesUtil.Activatable.update(listNode, "Import", true);
    });
}

var ImportNodes = function () {
    let utils = new Utils();
    let MgnlContext = utils.getMgnlContext();
    this.execute = function () {
        let restClient;
        let session = MgnlContext.getJCRSession(this.parameters.get("workspace"));
        let rootNode = session.getRootNode();
        let Notification = Java.type("com.vaadin.ui.Notification");

        try {
            restClient = utils.getRestClient("mailchimpRestClient");
            let res = restClient.invoke(this.parameters.get("restCall"));
            let body = JSON.parse(res.getEntity());
            let bodyProperty = this.parameters.get("bodyProperty");

            if (body.hasOwnProperty(bodyProperty)) {
                let items = body[bodyProperty];
                let contentType = this.parameters.get("contentModel");
                if (contentType == "mlchmp:campaign") {
                    ImportCampaignItems(items, session, rootNode, contentType);
                } else if (contentType == "mlchmp:list") {
                    ImportListItems(items, session, rootNode, contentType);
                } else {
                    throw "Unrecognized content type " + contentType;
                }
                Notification.show("Nodes imported successfully.", Notification.Type.HUMANIZED_MESSAGE)
                    .setDelayMsec(utils.getNotificationDelay());
            }
            if(this.content && this.content.isNode() && session.nodeExists(this.content.getPath())) {
                session.getItem(this.content.getPath()).remove();
            }
            session.save();
        } catch (err) {
            console.log("Could not retrieve data ", err);
            throw err;
        } finally {
            restClient.close();
        }
    }
};
new ImportNodes();