loadScript("/mailchimp-connector/backendScripts/js/utils.js");

var ExecuteBatchSubscribe = function () {
    var propertyUtil = Java.type("info.magnolia.jcr.util.PropertyUtil");
    var standardCharsets = Java.type("java.nio.charset.StandardCharsets");
    var ioUtils = Java.type("org.apache.commons.io.IOUtils");
    let utils = new Utils();
    let nodeUtil = utils.getNodeUtil();
    let MgnlContext = Java.type("info.magnolia.context.MgnlContext");
    let Notification = Java.type("com.vaadin.ui.Notification");
    let session = MgnlContext.getJCRSession(jcrWorkspace);

    this.execute = function () {
        var csvUuid = propertyUtil.getString(this.content, "csvDoc");
        var listId = propertyUtil.getString(this.content, "list");
        var nodeType = this.parameters.get("nodeType");
        var nodeName = this.content.toString().replace("/","");
        var node = nodeUtil.createPath(session.getRootNode(), nodeName, nodeType);

        try {
            if(damfn.getAssetForId(csvUuid).getMimeType() !== "text/csv") {
                throw "Invalid file type, the expected file type is csv."
            }
            var inByteArrayInputStream = damfn.getAssetForId(csvUuid).getContentStream();
            var stringifiedFile = ioUtils.toString(inByteArrayInputStream, standardCharsets.UTF_8);
            var csvMembers = [];
            var lines = stringifiedFile.split("\n");
            var columnTitles = lines[0].split("\t");
            var linesLength = lines.length;

            for (var i = 1; i < linesLength; i++) {
                if(lines[i].length > 0) {
                    var lineValues = lines[i].split("\t");
                    var csvMember = {};
                    for(var colNumber = 0; colNumber < columnTitles.length; colNumber ++) {
                        var col = columnTitles[colNumber].trim();
                        csvMember[col] = lineValues[colNumber].trim();
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
                        csvMembers.push(csvMember);
                    }
                }
            }

            var resp = restfn.call(
                this.parameters.get("restClient"),
                this.parameters.get("callName"),
                {"members": JSON.stringify(csvMembers), "listId": listId}
            );
            var resJson = JSON.parse(resp);
            var responseStatus = "success";

            if (resJson.errors && resJson.errors.length > 0) {
                responseStatus = "failure";
            }

            propertyUtil.setProperty(node, "status", responseStatus);
            session.save();

            if(responseStatus === "failure") {
                Notification.show("Could not import contacts to Mailchimp.", Notification.Type.ERROR_MESSAGE);
            } else {
                Notification.show("Successfully added contacts to Mailchimp.", Notification.Type.HUMANIZED_MESSAGE);
            }
        } catch(error) {
            console.log(error);
            let node = nodeUtil.createPath(session.getRootNode(), nodeName, nodeType);
            propertyUtil.setProperty(node, "status", "failure");
            session.save();
            Notification.show(error, Notification.Type.ERROR_MESSAGE);
        }
    }
}

new ExecuteBatchSubscribe();