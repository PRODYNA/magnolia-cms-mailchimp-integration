loadScript("/mailchimp-connector/templates/js/restClient.js");

var ScheduleMailchimpCampaignAction = function () {


    var propertyUtil = Java.type("info.magnolia.jcr.util.PropertyUtil");

    this.execute = function () {
        console.log("execute start");



        let campaign = propertyUtil.getString(this.content, "id");
        let scheduleAt = propertyUtil.getString(this.content, "schedule_time");


        let res = restfn.call("mailchimpCampaigns", "scheduleCampaign", {"id": campaign, "schedule_time": scheduleAt});
        console.log(res);
        console.log("execute end");

    }
}

new ScheduleMailchimpCampaignAction();