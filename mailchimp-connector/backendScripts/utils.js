var Utils = function () {
    var NodeUtil = Java.type("info.magnolia.jcr.util.NodeUtil");
    var NodeTypes = Java.type("info.magnolia.jcr.util.NodeTypes");
    var PropertyUtil = Java.type("info.magnolia.jcr.util.PropertyUtil");
    var MgnlContext = Java.type("info.magnolia.context.MgnlContext");
    const NOTIFICATION_DELAY = 5000;

    this.getRestClient= function(clientName) {
        return restClientFactory.createClient(restClientRegistry.getProvider(clientName).get());
    }

    this.getNodeUtil = function () {
        return NodeUtil;
    }

    this.getNodeTypes = function () {
        return NodeTypes;
    }

    this.getPropertyUtil = function() {
        return PropertyUtil;
    }

    this.getMgnlContext = function() {
        return MgnlContext;
    }

    this.getNotificationDelay = function() {
        return NOTIFICATION_DELAY;
    }
}