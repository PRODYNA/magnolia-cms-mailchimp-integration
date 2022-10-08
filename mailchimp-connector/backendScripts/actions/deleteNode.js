loadScript("/mailchimp-connector/backendScripts/utils.js");

var DeleteNode = function () {
    let utils = new Utils();
    let nodeUtil = utils.getNodeUtil();
    let magnoliaContext = Java.type("info.magnolia.context.MgnlContext");
    let propertyUtil = Java.type("info.magnolia.jcr.util.PropertyUtil");
    let notification = Java.type("com.vaadin.ui.Notification");
    let SUCCESS_DELETION_MESSAGE = 'Node was successfully deleted';
    let FAILURE_DELETION_MESSAGE = 'Node Deletion from Mailchimp failed: ';

    function deleteFromJCR(identifier) {
        let session = magnoliaContext.getJCRSession(this.parameters.get("workspace"));
        nodeUtil.getNodeByIdentifier(this.parameters.get("workspace"), identifier).remove();
        session.save();
        notification.show(SUCCESS_DELETION_MESSAGE, notification.Type.HUMANIZED_MESSAGE).setDelayMsec(5000);
    }

    this.execute = function () {
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
                            notification.show(FAILURE_DELETION_MESSAGE + responseMailchimpError, notification.Type.ERROR_MESSAGE).setDelayMsec(5000);
                        }
                    } catch (err) {
                        notification.show(FAILURE_DELETION_MESSAGE + statusInfo.getReasonPhrase(), notification.Type.ERROR_MESSAGE).setDelayMsec(5000);
                    }
                }
            } else {
                deleteFromJCR.call(this, identifier);
            }
        }  catch (err) {
            notification.show(FAILURE_DELETION_MESSAGE + err, notification.Type.ERROR_MESSAGE).setDelayMsec(5000);
        } finally {
            restClient.close();
        }
    }
}

new DeleteNode();