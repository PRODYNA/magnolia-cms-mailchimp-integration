loadScript("/mailchimp-connector/backendScripts/utils.js");

var DeleteMailchimpCampaignAction = function () {
    let utils = new Utils();
    let NodeUtil = utils.getNodeUtil();
    let MgnlContext = Java.type("info.magnolia.context.MgnlContext");
    let PropertyUtil = Java.type("info.magnolia.jcr.util.PropertyUtil");
    let Notification = Java.type("com.vaadin.ui.Notification");
    let SUCCESS_DELETION_MESSAGE = 'Campaign was successfully deleted';
    let FAILURE_DELETION_MESSAGE = 'Campaign Deletion from Mailchimp failed: ';

    function deleteFromJCR(identifier) {
        let session = MgnlContext.getJCRSession(this.parameters.get("workspace"));
        NodeUtil.getNodeByIdentifier(this.parameters.get("workspace"), identifier).remove();
        session.save();
        Notification.show(SUCCESS_DELETION_MESSAGE, Notification.Type.HUMANIZED_MESSAGE).setDelayMsec(5000);
    }

    this.execute = function () {
        console.log("execute start");
        let restClient;



        try {
            restClient = utils.getRestClient("mailchimpRestClient");
            let identifier = PropertyUtil.getString(this.content, "jcr:uuid");
            let campaignId = PropertyUtil.getString(this.content, "id");
            if (campaignId) {
                let res = restfn.callForResponse("mailchimpRestClient", this.parameters.get("restCall"), {"id": campaignId});
                let statusInfo = res.getStatusInfo();
                console.log(statusInfo);

                if (statusInfo.getStatusCode() === 204 || statusInfo.getStatusCode() === 404) {
                    deleteFromJCR.call(this, identifier);
                } else {
                    Notification.show(FAILURE_DELETION_MESSAGE + statusInfo.getReasonPhrase(), Notification.Type.ERROR_MESSAGE).setDelayMsec(5000);
                }

            } else {
                deleteFromJCR.call(this, identifier);
            }

            console.log("execute end");

        }  catch (err) {
            Notification.show(FAILURE_DELETION_MESSAGE + err, Notification.Type.ERROR_MESSAGE).setDelayMsec(5000);
        } finally {
            restClient.close();
        }

    }
}

new DeleteMailchimpCampaignAction();