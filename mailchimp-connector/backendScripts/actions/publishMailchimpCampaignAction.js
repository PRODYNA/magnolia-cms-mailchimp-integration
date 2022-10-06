loadScript("/mailchimp-connector/backendScripts/utils.js");

var PublishMailchimpCampaignAction = function () {

    let utils = new Utils();
    let nodeUtil = utils.getNodeUtil();
    let MgnlContext = Java.type("info.magnolia.context.MgnlContext");
    let PropertyUtil = Java.type("info.magnolia.jcr.util.PropertyUtil");
    let Node = Java.type("javax.jcr.Node");
    var propertyUtil = Java.type("info.magnolia.jcr.util.PropertyUtil");
    var HashMap = Java.type("java.util.HashMap");

    this.execute = function () {
        console.log("execute start");



        let type = propertyUtil.getString(this.content, "type");
        let title = propertyUtil.getString(this.content, "settings/title");
        let to_name = propertyUtil.getString(this.content, "settings/to_name");
        let from_name = propertyUtil.getString(this.content, "settings/from_name");
        let subject_line = propertyUtil.getString(this.content, "settings/subject_line");
        let list_id = propertyUtil.getString(this.content, "recipients/list_id");


        let restClient;
        let session = MgnlContext.getJCRSession(this.parameters.get("workspace"));
        let rootNode = session.getRootNode();

        try {
            console.log(this.parameters.get("workspace"))
            restClient = utils.getRestClient("mailchimpRestClient");
            let res = restClient.invoke(this.parameters.get("restCall"), {"type": type, "list_id": list_id, "title": title, "from_name": from_name, "to_name": to_name, "subject_line": subject_line});
            let body = JSON.parse(res.getEntity());
            let identifier = propertyUtil.getString(this.content, "jcr:uuid");
            let campaignNode = nodeUtil.getNodeByIdentifier(this.parameters.get("workspace"), identifier);
            PropertyUtil.setProperty(campaignNode, "id", body.id);
            PropertyUtil.setProperty(campaignNode, "status", body.status);
            session.save();
        } catch (err) {
            console.log("Could not retrieve data ", err);
        } finally {
            restClient.close();
        }

    }
}

new PublishMailchimpCampaignAction();