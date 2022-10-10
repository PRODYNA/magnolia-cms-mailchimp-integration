var CsvColumn = function () {
    this.apply = function(item) {
        if (!item.isNode()) {
            return null;
        }
        let propertyUtil = Java.type("info.magnolia.jcr.util.PropertyUtil");
        let csvUuid = propertyUtil.getString(item, "csvDoc");
        return damfn.getAsset(csvUuid).getPath();
    }
}
new CsvColumn();