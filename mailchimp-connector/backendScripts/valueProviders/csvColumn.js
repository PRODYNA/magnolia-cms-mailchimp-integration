var CsvColumn = function () {
    var propertyUtil = Java.type("info.magnolia.jcr.util.PropertyUtil");
    this.apply = function(item) {
        if (!item.isNode()) {
            return null;
        }
        var csvUuid = propertyUtil.getString(item, "csvDoc");
        var csvPath = damfn.getAsset(csvUuid).getPath();
        return csvPath;
    }
}
new CsvColumn();