loadScript("/mailchimp-connector/backendScripts/utils.js");

var DeleteMailchimpCampaignAction = function () {
    let utils = new Utils();
    let NodeUtil = utils.getNodeUtil();
    let MgnlContext = Java.type("info.magnolia.context.MgnlContext");
    let PropertyUtil = Java.type("info.magnolia.jcr.util.PropertyUtil");
    let Node = Java.type("javax.jcr.Node");
    let Notification = Java.type("com.vaadin.ui.Notification");
    let SUCCESS_DELETION_MESSAGE = 'Campaign was successfully deleted';
    let FAILURE_DELETION_MESSAGE = 'Campaign Deletion failed: ';
    this.execute = function () {
        console.log("execute start");
        let restClient;
        let session = MgnlContext.getJCRSession(this.parameters.get("workspace"));


        try {
            restClient = utils.getRestClient("mailchimpRestClient");
            let campaignId = PropertyUtil.getString(this.content, "id");
            let res = restClient.invoke(this.parameters.get("restCall"), {"id": campaignId});
            let statusInfo = res.getStatusInfo();
            if (statusInfo.getStatusCode() === 204) {

                let identifier = PropertyUtil.getString(this.content, "jcr:uuid");
                NodeUtil.getNodeByIdentifier(this.parameters.get("workspace"), identifier).remove();
                session.save();
                Notification.show(SUCCESS_DELETION_MESSAGE, Notification.Type.ASSISTIVE_NOTIFICATION).setDelayMsec(5000);

            } else {
                Notification.show(FAILURE_DELETION_MESSAGE + statusInfo.getReasonPhrase(), Notification.Type.ERROR_MESSAGE).setDelayMsec(5000);
            }


            // restfn.call("mailchimpCampaigns", "scheduleCampaign", {"id": campaign, "schedule_time": schedule_time});
            console.log("execute end");

        }  catch (err) {
        console.log("Could not retrieve data ", err);
        } finally {
            restClient.close();
        }

    }
}

new DeleteMailchimpCampaignAction();