var Utils = function () {
    var NodeUtil = Java.type("info.magnolia.jcr.util.NodeUtil");
    var NodeTypes = Java.type("info.magnolia.jcr.util.NodeTypes");

    /**
     * exposedComponents:
     *    restClientFactory:
     *        componentClass: info.magnolia.rest.client.factory.RestClientFactory
     *        name: restClientFactory
     *    restClientRegistry:
     *        componentClass: info.magnolia.rest.client.registry.RestClientRegistry
     *        name: restClientRegistry
     * */
    this.getRestClient= function(clientName) {
        return restClientFactory.createClient(restClientRegistry.getProvider(clientName).get());
    }

    /**
     * @see https://nexus.magnolia-cms.com/content/sites/magnolia.public.sites/ref/6.1/apidocs/info/magnolia/jcr/util/NodeUtil.html
     */
    this.getNodeUtil = function () {
        return NodeUtil;
    }

    /**
     * @see https://nexus.magnolia-cms.com/content/sites/magnolia.public.sites/ref/6.1/apidocs/info/magnolia/jcr/util/NodeTypes.html
     */
    this.getNodeTypes = function () {
        return NodeTypes;
    }
}