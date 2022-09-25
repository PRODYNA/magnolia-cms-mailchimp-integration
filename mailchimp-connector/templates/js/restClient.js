var RestClient = function () {


    var HttpClients = Java.type("org.apache.http.impl.client.HttpClients");
    var HttpGet = Java.type("org.apache.http.client.methods.HttpGet");
    var HttpPost = Java.type("org.apache.http.client.methods.HttpPost");

    var ArrayList = Java.type("java.util.ArrayList");
    var UrlEncodedFormEntity = Java.type("org.apache.http.client.entity.UrlEncodedFormEntity");
    var BasicNameValuePair = Java.type("org.apache.http.message.BasicNameValuePair");
    var EntityUtils = Java.type("org.apache.http.util.EntityUtils");
    var System = Java.type("java.lang.System");


    const API_KEY = System.getenv("MAILCHIMP_BASIC_AUTH");
    console.log(API_KEY);

    this.get = function (url) {
        var httpClient = HttpClients.createDefault();
        var httpGet = new HttpGet(url);
        httpGet.setHeader("Authorization", API_KEY);
        var response = httpClient.execute(httpGet);
        try {
            var entity = response.getEntity();
            return EntityUtils.toString(entity, "utf-8");
        } catch (e) {
            console.log(e)
        }finally {
            response.close();
        }
    }

    this.post = function (url, params) {
        var httpClient = HttpClients.createDefault();
        var httpPost = new HttpPost(url);
        var data = new ArrayList();

        for (var key in params) {
            data.add(new BasicNameValuePair(key, params[key]));
        }
        httpPost.setHeader("Authorization", API_KEY)

        response = httpClient.execute(httpPost);

        try {
            entity = response.getEntity();
            return EntityUtils.toString(entity, "utf-8");
        } finally {
            response.close();
        }
    }
}