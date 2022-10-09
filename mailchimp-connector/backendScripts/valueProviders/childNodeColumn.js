var ChildNodeColumn = function () {
    this.apply = function(item) {
        try {
            if (this.parameters.containsKey('path') && this.parameters.containsKey('property')) {
                let childNode = item.getNode(this.parameters['path']);
                return childNode.getProperty(this.parameters['property']).getString();
            }
        } catch (err) {
            return "";
        }
        return "";
    }
}

new ChildNodeColumn();