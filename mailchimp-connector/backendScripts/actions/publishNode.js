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

    function saveToJCR(node, session) {
        NodeTypeUtil.Activatable.update(node, "Magnolia Mailchimp App", true);
        session.save();
    }

    this.execute = function () {
        let nodeIdentifier = PropertyUtil.getString(this.content, "jcr:uuid");
        let node = NodeUtil.getNodeByIdentifier(this.parameters.get("workspace"), nodeIdentifier);
        let session = MgnlContext.getJCRSession(this.parameters.get("workspace"));
        let requestObject;
        let scheduleAt;
        if (NodeUtil.isNodeType(node, "mlchmp:campaign")) {
            requestObject = new CampaignRequest(this.content);
            scheduleAt = PropertyUtil.getString(this.content, "schedule_time");
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
                        PropertyUtil.setProperty(node, "status", responseBody.status);
                    }
                    NodeUtil.renameNode(node, responseBody.id);
                }
                if (NodeUtil.isNodeType(node, "mlchmp:campaign")) {
                    if (scheduleAt) {
                        let schedule_time_parse = new Date(scheduleAt);
                        let schedule_utc_time = Date.UTC(schedule_time_parse.getUTCFullYear(), schedule_time_parse.getUTCMonth(),
                            schedule_time_parse.getUTCDate(), schedule_time_parse.getUTCHours(),
                            schedule_time_parse.getUTCMinutes(), schedule_time_parse.getUTCSeconds());

                        let schedule_time = new Date(schedule_utc_time).toISOString();
                        let response = restfn.callForResponse("mailchimpRestClient", "scheduleCampaign", {
                            "id": responseBody.id,
                            "schedule_time": schedule_time
                        });
                        let statusInfo = response.getStatusInfo();
                        if (statusInfo.getStatusCode() === 204) {
                            saveToJCR(node, session);
                            Notification.show("Campaign published successfully to Mailchimp and scheduled at " + scheduleAt, Notification.Type.HUMANIZED_MESSAGE).setDelayMsec(5000);
                        } else {
                            try {
                                let responseMailchimpError = JSON.parse(response.getEntity()).detail;
                                if (responseMailchimpError) {
                                    Notification.show("Failed to publish and schedule campaign with error " + responseMailchimpError, Notification.Type.ERROR_MESSAGE).setDelayMsec(5000);
                                }
                            } catch (err) {
                                Notification.show("Failed to publish and schedule campaign with unknown error, API response is " + statusInfo.getReasonPhrase(), Notification.Type.ERROR_MESSAGE).setDelayMsec(5000);
                            }
                        }
                    } else {
                        saveToJCR(node, session);
                        Notification.show("Campaign published successfully to Mailchimp", Notification.Type.HUMANIZED_MESSAGE).setDelayMsec(5000);
                    }
                } else {
                    saveToJCR(node, session);
                    Notification.show("Node published successfully to Mailchimp", Notification.Type.HUMANIZED_MESSAGE).setDelayMsec(5000);
                }
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
