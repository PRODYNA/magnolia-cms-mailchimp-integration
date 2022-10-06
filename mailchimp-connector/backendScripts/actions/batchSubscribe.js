loadScript("/mailchimp-connector/backendScripts/js/utils.js");
var ExecuteBatchSubscribe = function () {
    var propertyUtil = Java.type("info.magnolia.jcr.util.PropertyUtil");
    var standardCharsets = Java.type("java.nio.charset.StandardCharsets");
    var ioUtils = Java.type("org.apache.commons.io.IOUtils");

    let utils = new Utils();
    // let nodeUtil = utils.getNodeUtil();
    let MgnlContext = Java.type("info.magnolia.context.MgnlContext");

    let Notification = Java.type("com.vaadin.ui.Notification");

    this.execute = function () {

        var csvUuid = propertyUtil.getString(this.content, "csvDoc");
        var listId = propertyUtil.getString(this.content, "list");
        var csvPath = damfn.getAsset(csvUuid).getPath();
        var jcrWorkspace = "csv-list";
        var nodeType = "pd:csv-list";


        var nodeName = this.content.toString().replace("/","");

        // get timestamp
        var date = new Date(Date.now());
        var formattedDate = date.getDate()+
            "-"+(date.getMonth()+1)+
            "-"+date.getFullYear()+
            "T"+date.getHours()+
            "."+date.getMinutes()+
            "."+date.getSeconds(); // format of date 4-10-2022_12.12.44

        try {
            if(damfn.getAssetForId(csvUuid).getMimeType() !== "text/csv") {
                throw "Invalid file type, the expected file type is csv."
            }

            // convert file to string
            var inByteArrayInputStream = damfn.getAssetForId(csvUuid).getContentStream(); // CHECK
            var stringifiedFile = ioUtils.toString(inByteArrayInputStream, standardCharsets.UTF_8);

            var csvMembers = []; // array that stores subscribers

            // Split Lines
            var lines = stringifiedFile.split("\n"); // lines array
            var columnTitles = lines[0].split("\t"); // column names array
            var linesLength = lines.length;

            // parse the lines except for the header line
            for (var i = 1; i < linesLength; i++) {
                if(lines[i].length > 0) {
                    var lineValues = lines[i].split("\t");
                    var csvMember = {};

                    // dynamically create JSON
                    for(var colNumber = 0; colNumber < columnTitles.length; colNumber ++) {
                        var col = columnTitles[colNumber].trim();
                        csvMember[col] = lineValues[colNumber].trim();

                        // static parts of the request
                        csvMember["email_type"] = "html";
                        csvMember["status"] = "subscribed";
                        csvMember["merge_fields"] = {};
                        csvMember["interests"] = {};
                        csvMember["language"] = "";
                        csvMember["vip"] = false;
                        csvMember["location"] = {
                            "latitude": 0,
                            "longitude": 0
                        };
                        // add json to array
                        csvMembers.push(csvMember);
                    }
                }
            }

            // call to mailchimp
            console.log("Executing CSV Import to Mailchimp");
            var customValues = {"members": JSON.stringify(csvMembers), "listId": listId};
            var resp = restfn.call("mailchimpClient", "batchSubscribeToList", customValues);
            console.log("Finished CSV Import to Mailchimp");

            let session = MgnlContext.getJCRSession(jcrWorkspace);
            let rootNode = session.getRootNode();
            let nodeUtil = utils.getNodeUtil();

            // check response - success/failure
            var resJson = JSON.parse(resp);

            var newMembers = "";
            var updatedMembers = "";
            var failedMembers = "";

            var responseStatus = "success";

            if(resJson.new_members && resJson.new_members.length > 0) {
                resJson.new_members.forEach((member) => {
                    newMembers += member.email_address + " successfully" + member.status + "\n";
                });
            }

            if(resJson.updated_members && resJson.updated_members.length > 0) {
                resJson.updated_members.forEach((member) => {
                    updatedMembers += member.email_address + " successfully updated" + "\n";
                });
            }

            if (resJson.errors && resJson.errors.length > 0) {
                responseStatus = "failure"
                resJson.errors.forEach((er) => {
                    if(er.error_code === "ERROR_CONTACT_EXISTS" || er.error_code === "ERROR_GENERIC") {
                        var finalError = er.error.split(",")[0];
                        failedMembers += finalError + "\n";
                    }
                });
            }
            console.log("CSV Import to Mailchimp status: " + responseStatus);

            var node = nodeUtil.createPath(rootNode, nodeName, nodeType);
            // var subNode = nodeUtil.createPath(node, "/logs_"+formattedDate, "pd:csv-list");
            // subNode.setProperty("request", JSON.stringify({"members": csvMembers}));
            // subNode.setProperty("response", resp.toString());
            // subNode.setProperty("csv file", JSON.stringify(csvUuid));
            node.setProperty("status", responseStatus);

            console.log("Saving to JCR");
            session.save();

            if(responseStatus === "failure") {
                Notification.show("Could not import emails to mailchimp.\n" + newMembers + updatedMembers + failedMembers, Notification.Type.ERROR_MESSAGE);
            } else {
                Notification.show("Successfully added emails to mailchimp.\n" + newMembers + updatedMembers + failedMembers, Notification.Type.HUMANIZED_MESSAGE);
            }

        } catch(error) {
            console.log(error);

            let session = MgnlContext.getJCRSession(jcrWorkspace);
            let rootNode = session.getRootNode();
            let nodeUtil = utils.getNodeUtil();
            let node = nodeUtil.createPath(rootNode, nodeName, nodeType);
            // let subNode = nodeUtil.createPath(node, "/logs_"+formattedDate, "pd:csv-list");
            // subNode.setProperty("csv file", JSON.stringify(csvUuid));
            node.setProperty("status", "failure");
            // subNode.setProperty("details", error);
            session.save();

            Notification.show(error, Notification.Type.ERROR_MESSAGE);
        }

        console.log("Finished batch import.");

    }
}

new ExecuteBatchSubscribe();