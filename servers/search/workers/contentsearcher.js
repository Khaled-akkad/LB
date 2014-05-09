var fs = require("fs");
var Fuse = require("../lib/fuse.js");

var isInitializingSearchIndex = false;
var searchIndices = null;

function initSearchIndex() {
	
	if (isInitializingSearchIndex) {
		return;
	}

	isInitializingSearchIndex = true;
	searchIndices = {};

	//Full text search setup
	var options = {
		keys: ["content", "title", "titlePath", "products"],
		distance: 8000,
		threshold: 0.3
	};

	//Iterate and add all search indices
	var previewFolders = fs.readdirSync(__dirname + "/../../site/chapters/");
	for (var i=0; i < previewFolders.length; i++) {
		if (previewFolders[i].indexOf("_index") > -1) {
			var index = JSON.parse(fs.readFileSync(__dirname + "/../../site/chapters/" + previewFolders[i] + "/" + previewFolders[i].replace("_index", ".json")));
			var id = previewFolders[i];

			//Remove root objects and "Terapirekommendationer / Faktarutor etc."
			index = index.filter(function(element) {
				return (element.title !== "root" && element.title !== "Terapirekommendationer / Faktarutor etc.");
			});
			
			searchIndices[id] = new Fuse(index, options);
		}
	}

	isInitializingSearchIndex = false;
}

initSearchIndex();

module.exports = function(input, callback) {

	var index = searchIndices[input.index];
	var results = index.search(input.term);

	//Create copy of array
	var trimmed = JSON.parse(JSON.stringify(results));

	//Remove products blob before returning or saving
	for (var i = trimmed.length - 1; i >= 0; i--){
		if (trimmed[i].products !== undefined) {
			trimmed[i].products = "";
		}
	}

	results = trimmed;

	callback(null, results);
}