loadScript("/mailchimp-connector/backendScripts/utils.js");

var ScheduleMailchimpCampaignAction = function () {
    let utils = new Utils();
    let MgnlContext = Java.type("info.magnolia.context.MgnlContext");
    let SUCCESS_SCHEDULE_MESSAGE = "The campaign was scheduled successfully at "
    let FAILURE_SCHEDULE_MESSAGE = "The campaign was not scheduled: ";
    let PropertyUtil = Java.type("info.magnolia.jcr.util.PropertyUtil");
    let NodeUtil = utils.getNodeUtil();
    let Notification = Java.type("com.vaadin.ui.Notification");

    this.execute = function () {
        console.log("execute start");
        let session = MgnlContext.getJCRSession("mailchimp");
        try {

            let campaign = PropertyUtil.getString(this.content, "id");
            let scheduleAt = PropertyUtil.getString(this.content, "schedule_time");
            let schedule_time_parse = new Date(scheduleAt);
            let schedule_utc_time = Date.UTC(schedule_time_parse.getUTCFullYear(), schedule_time_parse.getUTCMonth(),
                schedule_time_parse.getUTCDate(), schedule_time_parse.getUTCHours(),
                schedule_time_parse.getUTCMinutes(), schedule_time_parse.getUTCSeconds());

            var schedule_time = new Date(schedule_utc_time).toISOString();
            let res = restfn.callForResponse("mailchimpRestClient", "scheduleCampaign", {
                "id": campaign,
                "schedule_time": schedule_time
            });
            let statusInfo = res.getStatusInfo();
            if (statusInfo.getStatusCode() === 204) {
         
                // let identifier = PropertyUtil.getString(this.content, "jcr:uuid");
                // let campaignNode = NodeUtil.getNodeByIdentifier("mailchimp", identifier);
                // console.log(scheduleAt);
                // PropertyUtil.setProperty(campaignNode, "schedule_time", scheduleAt);
                // session.save();
                Notification.show(SUCCESS_SCHEDULE_MESSAGE + schedule_time, Notification.Type.HUMANIZED_MESSAGE).setDelayMsec(5000);
            } else {
                try {
                    let responseMailchimpError = JSON.parse(res.getEntity()).detail;
                    if (responseMailchimpError) {
                        Notification.show(FAILURE_SCHEDULE_MESSAGE + responseMailchimpError, Notification.Type.ERROR_MESSAGE).setDelayMsec(5000);
                    }
                } catch (err) {
                    console.log("hello")
                    Notification.show(FAILURE_SCHEDULE_MESSAGE + statusInfo.getReasonPhrase(), Notification.Type.ERROR_MESSAGE).setDelayMsec(5000);
                }
            }
            console.log("execute end");
        } catch (err) {
            console.log(err);
            Notification.show(FAILURE_SCHEDULE_MESSAGE + err, Notification.Type.ERROR_MESSAGE).setDelayMsec(5000);
        }

    }
}

new ScheduleMailchimpCampaignAction();