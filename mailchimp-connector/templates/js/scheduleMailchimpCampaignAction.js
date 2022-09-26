loadScript("/mailchimp-connector/templates/js/restClient.js");

var ScheduleMailchimpCampaignAction = function () {


    var propertyUtil = Java.type("info.magnolia.jcr.util.PropertyUtil");

    this.execute = function () {
        console.log("execute start");



        let campaign = propertyUtil.getString(this.content, "id");
        let scheduleAt = propertyUtil.getString(this.content, "schedule_time");
        let schedule_time_parse = new Date(scheduleAt);
        var schedule_utc_time = Date.UTC(schedule_time_parse.getUTCFullYear(), schedule_time_parse.getUTCMonth(),
            schedule_time_parse.getUTCDate(), schedule_time_parse.getUTCHours(),
            schedule_time_parse.getUTCMinutes(), schedule_time_parse.getUTCSeconds());


        const schedule_time = new Date(schedule_utc_time).toISOString();
        restfn.call("mailchimpCampaigns", "scheduleCampaign", {"id": campaign, "schedule_time": schedule_time});
        console.log("execute end");

    }
}

new ScheduleMailchimpCampaignAction();