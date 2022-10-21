loadScript("/mailchimp-connector/backendScripts/utils.js");

var DeleteNode = function () {
    let utils = new Utils();
    let Notification = Java.type("com.vaadin.ui.Notification");
    const SUCCESS_DELETION_MESSAGE = 'Node was successfully deleted';
    const FAILURE_DELETION_MESSAGE = 'Node Deletion from Mailchimp failed: ';

    function deleteFromJCR(identifier) {
        let nodeUtil = utils.getNodeUtil();
        let magnoliaContext = Java.type("info.magnolia.context.MgnlContext");
        let session = magnoliaContext.getJCRSession(this.parameters.get("workspace"));
        nodeUtil.getNodeByIdentifier(this.parameters.get("workspace"), identifier).remove();
        session.save();
        Notification.show(SUCCESS_DELETION_MESSAGE, Notification.Type.HUMANIZED_MESSAGE)
            .setDelayMsec(utils.getNotificationDelay());
    }

    this.execute = function () {
        let propertyUtil = utils.getPropertyUtil();
        let restClient = utils.getRestClient("mailchimpRestClient");
        try {
            let identifier = propertyUtil.getString(this.content, "jcr:uuid");
            let nodeId = propertyUtil.getString(this.content, "id");
            if (nodeId) {
                let res = restfn.callForResponse("mailchimpRestClient", this.parameters.get("restCall"), {"id": nodeId});
                let statusInfo = res.getStatusInfo();

                if (statusInfo.getStatusCode() === 204 || statusInfo.getStatusCode() === 404) {
                    deleteFromJCR.call(this, identifier);
                } else {
                    try {
                        var responseMailchimpError = JSON.parse(res.getEntity()).detail;
                        if (responseMailchimpError) {
                            Notification.show(FAILURE_DELETION_MESSAGE + responseMailchimpError, Notification.Type.ERROR_MESSAGE)
                                .setDelayMsec(utils.getNotificationDelay());
                        }
                    } catch (err) {
                        Notification.show(FAILURE_DELETION_MESSAGE + statusInfo.getReasonPhrase(), Notification.Type.ERROR_MESSAGE)
                            .setDelayMsec(utils.getNotificationDelay());
                    }
                }
            } else {
                deleteFromJCR.call(this, identifier);
            }
        }  catch (err) {
            Notification.show(FAILURE_DELETION_MESSAGE + err, Notification.Type.ERROR_MESSAGE)
                .setDelayMsec(utils.getNotificationDelay());
        } finally {
            restClient.close();
        }
    }
}

new DeleteNode();