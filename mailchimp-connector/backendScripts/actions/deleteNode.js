loadScript("/mailchimp-connector/backendScripts/utils.js");

var DeleteNode = function () {
    let utils = new Utils();
    let NodeUtil = utils.getNodeUtil();
    let MgnlContext = Java.type("info.magnolia.context.MgnlContext");
    let PropertyUtil = Java.type("info.magnolia.jcr.util.PropertyUtil");
    let Notification = Java.type("com.vaadin.ui.Notification");
    let SUCCESS_DELETION_MESSAGE = 'Node was successfully deleted';
    let FAILURE_DELETION_MESSAGE = 'Node Deletion from Mailchimp failed: ';

    function deleteFromJCR(identifier) {
        let session = MgnlContext.getJCRSession(this.parameters.get("workspace"));
        NodeUtil.getNodeByIdentifier(this.parameters.get("workspace"), identifier).remove();
        session.save();
        Notification.show(SUCCESS_DELETION_MESSAGE, Notification.Type.HUMANIZED_MESSAGE).setDelayMsec(5000);
    }

    this.execute = function () {
        let restClient = utils.getRestClient("mailchimpRestClient");
        try {
            let identifier = PropertyUtil.getString(this.content, "jcr:uuid");
            let nodeId = PropertyUtil.getString(this.content, "id");
            if (nodeId) {
                let res = restfn.callForResponse("mailchimpRestClient", this.parameters.get("restCall"), {"id": nodeId});
                let statusInfo = res.getStatusInfo();

                if (statusInfo.getStatusCode() === 204 || statusInfo.getStatusCode() === 404) {
                    deleteFromJCR.call(this, identifier);
                } else {
                    try {
                        var responseMailchimpError = JSON.parse(res.getEntity()).detail;
                        if (responseMailchimpError) {
                            Notification.show(FAILURE_DELETION_MESSAGE + responseMailchimpError, Notification.Type.ERROR_MESSAGE).setDelayMsec(5000);
                        }
                    } catch (err) {
                        Notification.show(FAILURE_DELETION_MESSAGE + statusInfo.getReasonPhrase(), Notification.Type.ERROR_MESSAGE).setDelayMsec(5000);
                    }
                }

            } else {
                deleteFromJCR.call(this, identifier);
            }
        }  catch (err) {
            Notification.show(FAILURE_DELETION_MESSAGE + err, Notification.Type.ERROR_MESSAGE).setDelayMsec(5000);
        } finally {
            restClient.close();
        }
    }
}

new DeleteNode();