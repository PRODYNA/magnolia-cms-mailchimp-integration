loadScript("/mailchimp-connector/backendScripts/utils.js");

var PublishMailchimpCampaignAction = function () {

    let utils = new Utils();
    let nodeUtil = utils.getNodeUtil();
    let MgnlContext = Java.type("info.magnolia.context.MgnlContext");
    let PropertyUtil = Java.type("info.magnolia.jcr.util.PropertyUtil");
    let propertyUtil = Java.type("info.magnolia.jcr.util.PropertyUtil");
    let Notification = Java.type("com.vaadin.ui.Notification");
    let SUCCESS_SYNCHRONIZATION_MESSAGE = 'Campaign was successfully send to mailchimp';
    let FAILURE_SYNCHRONIZATION_MESSAGE = 'There was a failure sending the campaign to mailchimp: ';
    this.execute = function () {
        console.log("execute start");
        let session = MgnlContext.getJCRSession(this.parameters.get("workspace"));

        let restClient;
        try{
            let type = propertyUtil.getString(this.content, "type");
            let title = propertyUtil.getString(this.content, "settings/title");
            let to_name = propertyUtil.getString(this.content, "settings/to_name");
            let from_name = propertyUtil.getString(this.content, "settings/from_name");
            let subject_line = propertyUtil.getString(this.content, "settings/subject_line");
            let list_id = propertyUtil.getString(this.content, "recipients/list_id");

            let campaignId = PropertyUtil.getString(this.content, "id");

            restClient = utils.getRestClient("mailchimpRestClient");
            if (campaignId) {

                let res = restClient.invoke("editCampaign", {
                    "id": campaignId,
                    "type": type,
                    "list_id": list_id,
                    "title": title,
                    "from_name": from_name,
                    "to_name": to_name,
                    "subject_line": subject_line
                });
                let statusInfo = res.getStatusInfo();
                console.log(statusInfo);
                console.log(statusInfo.getStatusCode());
                if (statusInfo.getStatusCode() === 200) {
                    let body = JSON.parse(res.getEntity());
                    let identifier = propertyUtil.getString(this.content, "jcr:uuid");
                    let campaignNode = nodeUtil.getNodeByIdentifier(this.parameters.get("workspace"), identifier);
                    PropertyUtil.setProperty(campaignNode, "status", body.status);
                    session.save();
                    Notification.show(SUCCESS_SYNCHRONIZATION_MESSAGE, Notification.Type.HUMANIZED_MESSAGE).setDelayMsec(5000);
                } else {
                    Notification.show(FAILURE_SYNCHRONIZATION_MESSAGE + statusInfo.getReasonPhrase(), Notification.Type.ERROR_MESSAGE).setDelayMsec(5000);

                }
            } else {

                let res = restClient.invoke("addCampaign", {
                    "type": type,
                    "list_id": list_id,
                    "title": title,
                    "from_name": from_name,
                    "to_name": to_name,
                    "subject_line": subject_line
                });
                let statusInfo = res.getStatusInfo();
                console.log(statusInfo);
                console.log(statusInfo.getStatusCode());
                if (statusInfo.getStatusCode() === 200) {
                    let body = JSON.parse(res.getEntity());
                    let identifier = propertyUtil.getString(this.content, "jcr:uuid");
                    let campaignNode = nodeUtil.getNodeByIdentifier(this.parameters.get("workspace"), identifier);
                    PropertyUtil.setProperty(campaignNode, "id", body.id);
                    nodeUtil.renameNode(campaignNode, body.id);
                    console.log(body.id);
                    PropertyUtil.setProperty(campaignNode, "status", body.status);
                    session.save();
                    Notification.show(SUCCESS_SYNCHRONIZATION_MESSAGE, Notification.Type.HUMANIZED_MESSAGE).setDelayMsec(5000);
                } else {
                    console.log(SUCCESS_SYNCHRONIZATION_MESSAGE + statusInfo.getReasonPhrase())
                    Notification.show(FAILURE_SYNCHRONIZATION_MESSAGE, Notification.Type.ERROR_MESSAGE).setDelayMsec(5000);
                }

            }
        } catch (err) {
            console.log(err);
            Notification.show(FAILURE_SYNCHRONIZATION_MESSAGE + err, Notification.Type.ERROR_MESSAGE).setDelayMsec(5000);
        } finally {
            restClient.close();
        }

    }
}

new PublishMailchimpCampaignAction();