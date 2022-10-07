loadScript("/mailchimp-connector/templates/js/restClient.js");

var ScheduleMailchimpCampaignAction = function () {

    let SUCCESS_SCHEDULE_MESSAGE = "The campaign was scheduled successfully at "
    let FAILURE_SCHEDULE_MESSAGE = "The campaign was not scheduled: ";
    let propertyUtil = Java.type("info.magnolia.jcr.util.PropertyUtil");
    let Notification = Java.type("com.vaadin.ui.Notification");

    this.execute = function () {
        console.log("execute start");

        try {

            let campaign = propertyUtil.getString(this.content, "id");
            let scheduleAt = propertyUtil.getString(this.content, "schedule_time");
            let schedule_time_parse = new Date(scheduleAt);
            let schedule_utc_time = Date.UTC(schedule_time_parse.getUTCFullYear(), schedule_time_parse.getUTCMonth(),
                schedule_time_parse.getUTCDate(), schedule_time_parse.getUTCHours(),
                schedule_time_parse.getUTCMinutes(), schedule_time_parse.getUTCSeconds());


            var schedule_time = new Date(schedule_utc_time).toISOString();
            let res = restfn.callForResponse("mailchimpCampaigns", "scheduleCampaign", {
                "id": campaign,
                "schedule_time": schedule_time
            });
            let statusInfo = res.getStatusInfo();
            
            if (statusInfo.getStatusCode() === 204) {
                Notification.show(SUCCESS_SCHEDULE_MESSAGE + schedule_time, Notification.Type.HUMANIZED_MESSAGE).setDelayMsec(5000);
            } else {
                Notification.show(FAILURE_SCHEDULE_MESSAGE + statusInfo.getReasonPhrase(), Notification.Type.ERROR_MESSAGE).setDelayMsec(5000);
            }
            console.log("execute end");
        } catch (err) {
            console.log(err);
            Notification.show(FAILURE_SCHEDULE_MESSAGE, Notification.Type.HUMANIZED_MESSAGE).setDelayMsec(5000);
        }

    }
}

new ScheduleMailchimpCampaignAction();