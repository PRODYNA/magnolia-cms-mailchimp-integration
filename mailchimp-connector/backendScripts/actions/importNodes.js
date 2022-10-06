loadScript("/mailchimp-connector/backendScripts/utils.js");

var ImportCampaignItems = function(items, session, rootNode, contentType) {
    let utils = new Utils();
    let nodeUtil = utils.getNodeUtil();
    let PropertyUtil = Java.type("info.magnolia.jcr.util.PropertyUtil");
    let SimpleDateFormat = Java.type("java.text.SimpleDateFormat");
    items.forEach(entity => {
        if(session.nodeExists("/" + entity.id)) {
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

        console.log(entity.id);
        console.log("schedule_time: " + entity.send_time);
        let scheduleTime;

        if (entity.send_time) {
            let dt = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssX");
            scheduleTime = dt.parse(entity.send_time);
        }
        else {
            scheduleTime = null;
        }
        console.log(scheduleTime);
        PropertyUtil.setProperty(campaignNode, "schedule_time", scheduleTime);
    });
}

var ImportListItems = function(items, session, rootNode, contentType) {
    let utils = new Utils();
    let nodeUtil = utils.getNodeUtil();
    let PropertyUtil = Java.type("info.magnolia.jcr.util.PropertyUtil");
    items.forEach(entity => {
        if(session.nodeExists("/" + entity.id)) {
            session.getItem("/" + entity.id).remove();
        }
        let listNode = nodeUtil.createPath(rootNode, entity.id, contentType);
        PropertyUtil.setProperty(listNode, "id", entity.id);
        PropertyUtil.setProperty(listNode, "name", entity.name);
        PropertyUtil.setProperty(listNode, "members", entity.stats.member_count);
    });
}

var ImportNodes = function () {
    let utils = new Utils();
    let MgnlContext = Java.type("info.magnolia.context.MgnlContext");
    this.execute = function () {
        let restClient;
        let session = MgnlContext.getJCRSession(this.parameters.get("workspace"));
        let rootNode = session.getRootNode();

        try {
            restClient = utils.getRestClient("mailchimpRestClient");
            let res = restClient.invoke(this.parameters.get("restCall"));
            let body = JSON.parse(res.getEntity());
            let bodyProperty = this.parameters.get("bodyProperty");

            if (body.hasOwnProperty(bodyProperty)) {
                let items = body[bodyProperty];
                let contentType = this.parameters.get("contentModel");

                if (contentType ==="mlchmp:campaign") {
                    ImportCampaignItems(items, session, rootNode, contentType);
                } else if (contentType === "mlchmp:list") {
                    ImportListItems(items, session, rootNode, contentType);
                } else {
                    throw "Unrecognized content type " + contentType;
                }
            }
            if(this.content && this.content.isNode() && session.nodeExists(this.content.getPath())) {
                session.getItem(this.content.getPath()).remove();
            }
            session.save();
        } catch (err) {
            console.log("Could not retrieve data ", err);
        } finally {
            restClient.close();
        }
    }
};
new ImportNodes();