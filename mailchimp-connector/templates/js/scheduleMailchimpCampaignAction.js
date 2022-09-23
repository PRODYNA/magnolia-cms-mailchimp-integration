loadScript("/mailchimp-connector/templates/js/restClient.js");

var ScheduleMailchimpCampaignAction = function () {
    // console.log(this.content.schedule_time);

    var baseUrl = "https://{api_server}.api.mailchimp.com/3.0";
    var restClient = new RestClient();

    var propertyUtil = Java.type("info.magnolia.jcr.util.PropertyUtil");

    this.execute = function () {
        console.log("execute start");
        // console.log(this.content.schedule_time);
        /**
         * Returns all posts from the JSON Placeholder service.
         *
         * @returns {JSON object}
         */
        let schedules = restClient.get(baseUrl + "/campaigns");
        console.log(schedules);


        /**
         * Creates new post in the JSON Placeholder service.
         *
         * @param data
         * @returns {JSON object}
         */
        let campaign = propertyUtil.getString(this.content, "id");
        let scheduleAt = propertyUtil.getString(this.content, "schedule_time");


        console.log(campaign);
        console.log(scheduleAt);
        const url = baseUrl + "/campaigns/" + campaign + "/actions/schedule";
        console.log(url);
        let data = {"schedule_time": scheduleAt};
        let res = restClient.post(url, data);
        console.log(res);
        console.log("execute end");
    }
}

new ScheduleMailchimpCampaignAction();