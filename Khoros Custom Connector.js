var startDate = new Date(DOMO.getStartDate(metadata.parameters["Date Range"]));
var endDate = new Date(DOMO.getEndDate(metadata.parameters["Date Range"]));
var fields = "78,79,80,81,82,83,84,85,108,110,111,112,113,114,115,116,117,118,119,120,121,122,126,127,128,130,131,132,133,134,135,136,138,139,140,141,142,143,144,146,147,148,150,151,153,154,155,156,219,220,222,231,232,274,329,351,352,353";
var accountFields = "0,1,9,10,14,15,16,17,20,21,24,25,27,28,33,34,35,36,38,39,41,42,207,208,209,210,211,212,213,214,277,278";
var token = metadata.account.apikey;

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

if (endDate instanceof Date === false || startDate instanceof Date === false) {
  datagrid.error(1, 'Please choose a valid single date for each date selector');
}

startDate = formatDate(startDate);
endDate = formatDate(endDate);

if (metadata.report === "Daily Post Summary") {

//kickoff report generation
var data = "{\"query\":{\"start\":\""+startDate+"\",\"stop\":\""+endDate+"\",\"fields\":[" + fields + "]}}";
httprequest.addHeader('authorization', 'Bearer ' + token);
httprequest.addHeader('content-type', 'application/json');

// push request for report to Khoros and get response code
var res = httprequest.post("https://api.spredfast.com/v2/analytics/export/daily_post_summary?delimiter=%2C", data);
var responseCode = httprequest.getStatusCode();

if (responseCode != 200) {
  datagrid.error(2, 'There was a problem sending the request to Khoros');
}


//DOMO.log('responseCode: ' + responseCode);

var expt = JSON.parse(res);
if (isNaN(expt.export_id)) {
  datagrid.error('3', 'There was a problem getting the report ID');
} else {
  var expt_id = expt.export_id;
}

// create placeholder variables for report when finished
var stat = "";
var url;

// cycle until report is ready for export
while(stat != 'complete') {
  var expt = httprequest.get("https://api.spredfast.com/v2/analytics/export/"+expt_id+"/status");
  var result = JSON.parse(expt);
  stat = result.status;
  // look for valid url to be downloaded later 
  if (result.url !== undefined) {
    url = result.url;
  }
  DOMO.sleep(5000);
}

DOMO.log('Report is ready for download! URL: ' + url.substring(0,20) + '...');

// download csv
httprequest.clearHeaders("https://api.spredfast.com/v2/analytics/export/daily_post_summary?delimiter=%2C");
var csv = httprequest.get(url);
csv = csv.replace(/"/g, '');

// store to domo
datagrid.magicParseCSV(csv);
}

if (metadata.report === "Daily Account Level Metrics") {

//kickoff report generation
var data = "{\"query\":{\"start\":\""+startDate+"\",\"stop\":\""+endDate+"\",\"fields\":[" + accountFields + "]}}";
httprequest.addHeader('authorization', 'Bearer ' + token);
httprequest.addHeader('content-type', 'application/json');

// push request for report to Khoros and get response code
var res = httprequest.post("https://api.spredfast.com/v2/analytics/export/accounts?delimiter=%2C", data);
var responseCode = httprequest.getStatusCode();

if (responseCode != 200) {
  datagrid.error(2, 'There was a problem sending the request to Khoros');
}


//DOMO.log('responseCode: ' + responseCode);

var expt = JSON.parse(res);
if (isNaN(expt.export_id)) {
  datagrid.error('3', 'There was a problem getting the report ID');
} else {
  var expt_id = expt.export_id;
}

// create placeholder variables for report when finished
var stat = "";
var url;

// cycle until report is ready for export
while(stat != 'complete') {
  var expt = httprequest.get("https://api.spredfast.com/v2/analytics/export/"+expt_id+"/status");
  var result = JSON.parse(expt);
  stat = result.status;
  // look for valid url to be downloaded later 
  if (result.url !== undefined) {
    url = result.url;
  }
  DOMO.sleep(5000);
}

DOMO.log('Report is ready for download! URL: ' + url.substring(0,20) + '...');

// download csv
httprequest.clearHeaders("https://api.spredfast.com/v2/analytics/export/daily_post_summary?delimiter=%2C");
var csv = httprequest.get(url);
csv = csv.replace(/"/g, '');

// store to domo
datagrid.magicParseCSV(csv);
}