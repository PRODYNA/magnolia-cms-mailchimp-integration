loadScript("/mailchimp-connector/backendScripts/utils.js");

var publishNode = function () {
    let utils = new Utils();
    let NodeUtil = utils.getNodeUtil();
    let NodeTypeUtil = utils.getNodeTypes();
    let MgnlContext = Java.type("info.magnolia.context.MgnlContext");
    let PropertyUtil = Java.type("info.magnolia.jcr.util.PropertyUtil");
    let Notification = Java.type("com.vaadin.ui.Notification");

    function CampaignRequest(content) {
        return {
            id: PropertyUtil.getString(content, "id"),
            type: PropertyUtil.getString(content, "type"),
            list_id: PropertyUtil.getString(content, "recipients/list_id"),
            subject_line: PropertyUtil.getString(content, "settings/subject_line"),
            title: PropertyUtil.getString(content, "settings/title"),
            to_name: PropertyUtil.getString(content, "settings/to_name"),
            from_name: PropertyUtil.getString(content, "settings/from_name")
        };
    }

    function ListRequest(content) {
        return {
            id: PropertyUtil.getString(content, "id"),
            name: PropertyUtil.getString(content, "name"),
            company: PropertyUtil.getString(content, "contact/company"),
            address1: PropertyUtil.getString(content, "contact/address1"),
            city: PropertyUtil.getString(content, "contact/city"),
            country: PropertyUtil.getString(content, "contact/country"),
            zip: PropertyUtil.getString(content, "contact/zip"),
            state: PropertyUtil.getString(content, "contact/state"),
            permission_reminder: PropertyUtil.getString(content, "permission_reminder"),
            from_name: PropertyUtil.getString(content, "campaign_defaults/from_name"),
            from_email: PropertyUtil.getString(content, "campaign_defaults/from_email"),
            subject: PropertyUtil.getString(content, "campaign_defaults/subject"),
            language: PropertyUtil.getString(content, "campaign_defaults/language"),
            email_type_option: PropertyUtil.getBoolean(content, "email_type_option", false)
        };
    }

    this.execute = function () {
        let nodeIdentifier = PropertyUtil.getString(this.content, "jcr:uuid");
        let node = NodeUtil.getNodeByIdentifier(this.parameters.get("workspace"), nodeIdentifier);
        let session = MgnlContext.getJCRSession(this.parameters.get("workspace"));
        let requestObject;

        if (NodeUtil.isNodeType(node, "mlchmp:campaign")) {
            requestObject = new CampaignRequest(this.content);
        } else if (NodeUtil.isNodeType(node, "mlchmp:list")) {
            requestObject = new ListRequest(this.content);
        } else {
            throw "Unknown node type to publish";
        }

        let restClient = utils.getRestClient("mailchimpRestClient");
        let restCallPrefix = requestObject.id ? "edit" : "add";
        if (restCallPrefix === "add") {
            delete requestObject.id;
        }
        let restCall = restCallPrefix + this.parameters.get("restCallSuffix");

        try {
            let response = restClient.invoke(restCall, requestObject);
            console.log(JSON.stringify(response.getEntity));

            let responseStatus = response.getStatusInfo();
            let responseBody = JSON.parse(response.getEntity());
            console.log(JSON.stringify(responseBody));

            if (responseStatus.getStatusCode() === 200) {
                if (restCallPrefix === "add") {
                    PropertyUtil.setProperty(node, "id", responseBody.id);
                    if (responseBody.status) {
                        PropertyUtil.setProperty(campaignNode, "status", responseBody.status);
                    }
                    NodeUtil.renameNode(node, responseBody.id);
                }
                NodeTypeUtil.Activatable.update(node, "Magnolia Mailchimp App", true);
                session.save();
                Notification.show("Node published successfully to Mailchimp", Notification.Type.HUMANIZED_MESSAGE).setDelayMsec(5000);
            } else {
                try {
                    Notification.show("Failed to publish node with error " + responseBody.detail, Notification.Type.ERROR_MESSAGE).setDelayMsec(5000);
                } catch (err) {
                    Notification.show("Failed to publish node with unknown error, API response is " + responseStatus.getReasonPhrase(), Notification.Type.ERROR_MESSAGE).setDelayMsec(5000);
                }
            }
        } catch(err) {
            throw err;
        } finally {
            restClient.close();
        }
    }
}

new publishNode();
