var ChildNodeColumn = function () {
    this.apply = function(item) {
        if (!item.isNode()) {
            return null;
        }



        if (this.parameters.containsKey('path') && item.getDepth() == 1) {
            return columnValue = item.getProperty(this.parameters['path']).getString();
        }


        return "";
    }
}

new ChildNodeColumn();