$(document).ready(function() {

	function getUrlParameter(sParam) {
		var sPageURL = window.location.search.substring(1);
		var sURLVariables = sPageURL.split('&');
		for (var i = 0; i < sURLVariables.length; i++) 
		{
			var sParameterName = sURLVariables[i].split('=');
			if (sParameterName[0] == sParam) 
			{
				return sParameterName[1];
			}
		}
	}

	//Publish external
	$("a#publishExternal").on("click", function(event) {
		
		event.preventDefault();

		var sendAllFiles = $("#sendAllFiles").prop("checked");
		
		var button = $(this);
		button.find("i").first().addClass("fa-spin");
		button.attr("disabled", "disabled");
		button.find("span.text").text("Publicerar...");
		
		var continuePolling = true;

		var progressBar = $("div.publish-progress");
		progressBar.css("width", 0 + "%").attr("aria-valuenow", 0).find(".indicator").text("0%");

		if (sendAllFiles) {
			sendAllFiles = "?sendallfiles=true";
		} else {
			sendAllFiles = "";
		}
		
		//Make initial request
		$.get("/cms/content/publishexternal" + sendAllFiles, function() {

			(function poll(){
				setTimeout(function(){
					$.ajax({url: "/cms/content/tasksstatus", success: function(data){

						if (data.finished === data.toBeProcessed) {
							continuePolling = false;
						} else {
							continuePolling = true;
						}
				
						//Update 
						var percentFinished = (data.finished / data.toBeProcessed) * 100;
						var statusText = data.finished + "/" + data.toBeProcessed;
						progressBar.css("width", percentFinished + "%").attr("aria-valuenow", percentFinished).find(".indicator").text(statusText);
				
						//Setup the next poll recursively
						if (continuePolling) {
							setTimeout(poll, 1000);
							//poll();
						} else {
							button.find("i").first().removeClass("fa-spin");
							button.removeAttr("disabled");
							button.find("span.text").text("Starta publicering till skarp site");
							
						}
					}, dataType: "json"});
				}, 100);
			})();

		})
		.fail(function() {
			alert("Error initiating publish to external site");
		});

	});

	//Rebuild all pages
	$("a#recreateAll").on("click", function(event) {
		
		event.preventDefault();
		
		var button = $(this);
		button.find("i").first().addClass("fa-spin");
		button.attr("disabled", "disabled");
		button.find("span.text").text("Bygger om...");
		
		var continuePolling = true;

		var progressBar = $("div.tasks-progress");
		progressBar.css("width", 0 + "%").attr("aria-valuenow", 0);
		
		//Make initial request
		$.get("/cms/content/recreateall", function() {

			(function poll(){
				setTimeout(function(){
					$.ajax({url: "/cms/content/tasksstatus", success: function(data){

						if (data.finished === data.toBeProcessed) {
							continuePolling = false;
						} else {
							continuePolling = true;
						}
				
						//Update 
						var percentFinished = (data.finished / data.toBeProcessed) * 100;
				
						progressBar.css("width", percentFinished + "%").attr("aria-valuenow", percentFinished);
				
						//Setup the next poll recursively
						if (continuePolling) {
							setTimeout(poll, 1000);
						} else {
							button.find("i").first().removeClass("fa-spin");
							button.removeAttr("disabled");
							button.find("span.text").text("Starta");
							
						}
					}, dataType: "json"});
				}, 100);
			})();

		})
		.fail(function() {
			alert("error");
		});

	});

	//Fetch github status text once when the modal is shown
	$('#saveContentToGitHub').on('shown.bs.modal', function (e) {
		
		var statusUpdate = $("pre#github-status");
		
		$.ajax({url: "/cms/status/github.json", success: function(data){

			//Update 
			var output = [];
			
			for (var i = 0; i < data.length; i++) {
				var time = new Date(data[i].date);
				
				output.push(time.toLocaleString() + "\t" + data[i].message);
			}
			
			statusUpdate.html(output.join("\n"));
	
		}, dataType: "json"});
	});

	//Save to GitHub
	$("a#saveToGitHub").on("click", function(event) {
		
		event.preventDefault();
		
		var button = $(this);
		button.find("i").first().removeClass("fa-github").addClass("fa-refresh").addClass("fa-spin");
		button.attr("disabled", "disabled");
		button.find("span.text").text("Laddar upp...");
		
		var continuePolling = true;

		var statusUpdate = $("pre#github-status");

		(function poll(){
			setTimeout(function(){
				$.ajax({url: "/cms/status/github.json", success: function(data){

					//Update 
					var output = [];
					
					for (var i = 0; i < data.length; i++) {
						var time = new Date(data[i].date);
						
						output.push(time.toLocaleString() + "\t" + data[i].message);
					}
					
					statusUpdate.html(output.join("\n"));
			
					//Setup the next poll recursively
					if (continuePolling) {
						setTimeout(poll, 300);
					} else {
						button.find("i").first().removeClass("fa-spin").removeClass("fa-refresh").addClass("fa-github");
						button.removeAttr("disabled");
						button.find("span.text").text("Starta uppladdning till GitHub");
						
					}
				}, dataType: "json"});
			}, 100);
		})();

		
		//Make initial request
		$.get(button.attr("href"), function() {
			
			continuePolling = false;

		})
		.fail(function() {
			alert("error");
		});

	});


	$("button.viewsize").on("click", function(event) {
		
		var button = $(this);

		var newWidth = "768px";
		var newHeight = "600px";
		
		if (button.hasClass("mobile")) {
			newWidth = "320px";
			newHeight = "480px";
		} else if (button.hasClass("tablet")) {
			newWidth = "768px";
			newHeight = "600px";
		} else if (button.hasClass("desktop")) {
			newWidth = "1025px";
			newHeight = "600px";
		}
		
		var frameContainer = button.parent().parent().next();
		if (frameContainer.length === 1) {
			var frame = frameContainer.find("iframe").first();
		
			if (frame.length === 1) {
				frame.attr("width", newWidth);
				frame.attr("height", newHeight);
				
				if (frameContainer.width() > frame.width()) {
					var newLeft = ((frameContainer.width() / 2) - (frame.width() / 2)) + "px";
					frame.css("left", newLeft);
					frame.css("position", "relative");
				} else {
					frame.css("left", "0px");
				}
			}
		} 
		
		button.parent().find(".active").removeClass("active");
		button.addClass("active");

	});

	//Append datetime picker
	$(".datetime").appendDtpicker({
		"locale": "sv",
		"firstDayOfWeek": 1,
		//"timelistScroll": false,
		"calendarMouseScroll": false,
		"dateFormat": "YYYY-MM-DD hh:mm",
		//"minuteInterval": 15,
		"autodateOnStart": false
	});

	function scrollTo(id) {
		$('html, body').animate({
			scrollTop: $(id).offset().top
		}, 0);
	}
	
	var idParameter = getUrlParameter("id");

	//console.log(idParameter);

	if (idParameter !== undefined && $("#" + idParameter).length === 1) {
		setTimeout(function() {
			scrollTo("#" + idParameter);
		}, 100);
	}
	
	$("button.removeContent").on("click", function(event) {
		$("input#removeContentName").val($(this).attr("data-content-name"));
	});

	$("button.modifyMetadata").on("click", function(event) {
		$("input#metakey").val($(this).attr("data-meta-key"));
		$("input#metavalue").val($(this).attr("data-meta-value"));
	});

	$("button.createMetadata").on("click", function(event) {
		$("input#metakey").val("");
		$("input#metavalue").val("");
	});

	$("button.removeMetadata").on("click", function(event) {
		$("input#removemetakey").val($(this).attr("data-meta-key"));
	});
	
	$("button.add-content").on("click", function(event) {
		if ($(this).attr("data-after") !== undefined) {
			$("input#insertafter").val($(this).attr("data-after"));
		} else {
			$("input#insertafter").val("");
		}
	});
	
	$("button[type='submit']").on("click", function(event) {
		if ($(this).attr("data-submit-id") !== undefined) {
			try {
				history.pushState({}, "", "?id=" + $(this).attr("data-submit-id"));
			} catch(e) {
				
			}
		}
	});
	
	$("button.show-diff").on("click", function(event) {
		var self = this;

		var icon = $(self).find("i.fa");
		
		if (icon.hasClass("fa-chevron-down")) {

			$.getJSON("/cms/content/diff?current=" + $(this).attr("data-page-id") + "&previous=" + $(this).attr("data-snapshot-id"), function(data, textStatus, xhr) {
				//Find closest diff-view
				var parentListItem = $(self).parent().parent();
				var diffViewer = parentListItem.find(".diff-view").first();
				diffViewer.html(data.html);
				
				if (data.html === "") {
					diffViewer.html("Inga skillnader jämfört med senaste utkastet.");
				}
				
				icon.removeClass("fa-chevron-down").addClass("fa-chevron-up");
			})
			.fail(function() {
				console.log("Error fetching diff");
			});
			
		} else {
			icon.removeClass("fa-chevron-up").addClass("fa-chevron-down");
			var parentListItem = $(self).parent().parent();
			var diffViewer = parentListItem.find(".diff-view").first();
			diffViewer.html("");
		}
		

	});
	
	picturefill();

	
	$('#show-draft').click(function(event) {

		event.preventDefault();

		var url = $(this).attr("href");

		$("#draftModal").modal();

		$("#draftModal").on('show.bs.modal', function () {

			$("#draftFrame").prop("src", url);

		});

	    $('#draftModal').modal("show");

	});

	$('#show-published').click(function(event) {

		event.preventDefault();

		var url = $(this).attr("href");

		$("#publishedModal").modal();

		$("#publishedModal").on('show.bs.modal', function () {

			$("#publishedFrame").prop("src", url);

		});

	    $('#publishedModal').modal("show");

	});
	
	$("body").on("click", "input.select-image", function(event) {

		var input = $(this);

		//Fetch images
		$.getJSON("/cms/images/all")
			.done(function(images) {

				var folders = {};

				for (var i = 0; i < images.length; i++) {
					var imagePath = images[i];
					var imagePathParts = imagePath.split("/");
					var imageName = imagePathParts.pop();
					var imageDirPath = imagePathParts.join("/");

					if (imageDirPath === "") {
						imageDirPath = "/";
					}

					if (folders[imageDirPath] === undefined) {
						folders[imageDirPath] = [];
					}
					
					folders[imageDirPath].push({name: imageName, path: imagePath});
				}
				
				var imagePicker = $("#pickImageModal").find("div.modal-body").first();
				
				imagePicker.empty();
				
				var first = true;
				
				for (var folderName in folders) {
					//console.log(folderName);

					var id = "id_" + folderName.replace(/\//g, "-");
					var heading = "heading_" + folderName.replace(/\//g, "-");

					var images = folders[folderName];

					var htmlToAppend = [];

					htmlToAppend.push('<div class="panel panel-default">');
					htmlToAppend.push('<div class="panel-heading" role="tab" id="' + heading + '">');
					htmlToAppend.push('<h4 class="panel-title">');
					if (first) {
						htmlToAppend.push('<a data-toggle="collapse" data-parent="#image-picker" href="#' + id + '" aria-expanded="true" aria-controls="' + id + '">');
					} else {
						htmlToAppend.push('<a class="collapsed" data-toggle="collapse" data-parent="#image-picker" href="#' + id + '" aria-expanded="false" aria-controls="' + id + '">');
					}
					htmlToAppend.push(folderName);
					htmlToAppend.push('</a>');
					htmlToAppend.push('</h4>');
					htmlToAppend.push('</div>');
					if (first) {
						htmlToAppend.push('<div id="' + id + '" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="' + heading + '">');
					} else {
						htmlToAppend.push('<div id="' + id + '" class="panel-collapse collapse" role="tabpanel" aria-labelledby="' + heading + '">');
					}
					htmlToAppend.push('<div class="panel-body">');
					htmlToAppend.push('<div class="row">');

					for (var i = 0; i < images.length; i++) {

						var imagePath = "/cms/draft" + images[i].path + "/small.png";

						htmlToAppend.push('<div class="col-sm-6 col-md-4">');
						htmlToAppend.push('<div class="thumbnail"><img src="' + imagePath + '">');
						htmlToAppend.push('<div class="caption">');
						htmlToAppend.push('<h3>' + images[i].name + '</h3>');
						
						htmlToAppend.push('<p><button data-value="' + images[i].path + '" class="btn btn-primary choose-image-button"><i class="fa fa-check"></i> Använd</button></p>');
						htmlToAppend.push('</div>');
						htmlToAppend.push('</div>');
						htmlToAppend.push('</div>');
					}

					htmlToAppend.push('</div></div></div></div>');
					
					var appendItem = $(htmlToAppend.join(""));
					
					appendItem.on("click", ".choose-image-button", function(event) {
						input.val($(this).attr("data-value"));
						$("#pickImageModal").modal("hide");
					});
					
					imagePicker.append(appendItem);
					
					first = false;
				}
				
				imagePicker.collapse();

				$("#pickImageModal").modal();
			})
			.fail(function( jqxhr, textStatus, error ) {
				var err = textStatus + ", " + error;
				console.log("Request Failed: " + err);
			});

	});
});

$("#contentTypeFilter").on("change", function(event) {
	if (this.value === "all") {
		$(".contentItemOverview").show();
	} else {
		$(".contentItemOverview").hide();
		$(".contentItemOverview." + this.value).show();
	}
});

$(".showFullPreview").on("click", function(event) {
	$(this).parent().prev().css("max-height", "none");
	$(this).parent().remove();
});

$(".expandContentEditor").on("click", function(event) {
	var editorContentView = $(this).parent().parent().parent();
	var previewContent = editorContentView.next();
	
	editorContentView.toggleClass("col-sm-7");
	editorContentView.toggleClass("col-sm-12");

	previewContent.toggleClass("col-sm-5");
	previewContent.toggleClass("hidden");
	
	if ($(this).find("i").first().hasClass("fa-expand")) {
		$(this).html("<i class=\"fa fa-compress\"></i> Minska");
	} else {
		$(this).html("<i class=\"fa fa-expand\"></i> Bredda");
	}
	
});


$("textarea.mce").on("focus", function(event) {

	if ($(this).attr("data-mce-initialized") === undefined) {

		$(this).attr("data-mce-initialized", "true");
		
		if ($(this).attr("id") === undefined) {
			var elementName = $(this).attr("name").replace(/\:/g, "_").replace(/\-/g, "_");
			$(this).attr("id", elementName);
		}

		var id = $(this).attr("id");

		//console.log("init: textarea#" + id);
		
		tinymce.init({
			selector: "textarea#" + id,
			theme: "modern",
			plugins: [
				"advlist autolink autoresize lists link image charmap print preview hr anchor pagebreak",
				"searchreplace wordcount visualblocks visualchars code fullscreen",
				"insertdatetime media nonbreaking save table contextmenu directionality",
				"emoticons template paste textcolor colorpicker textpattern",
				"fontawesome noneditable"
			],
			//content_css: "/cms/draft/css/styles.min.css,/cms/draft/css/lb.min.css",
			content_css: "/cms/stylesheets/tinymcepreview.css, /cms/font-awesome-4.3.0/css/font-awesome.min.css",
			link_list: "/cms/utils/links.json",
/*
			table_class_list: [
				{title: 'None', value: ''},
				{title: 'Terapirekommendation', value: 'therapyRecommendation'},
				{title: 'Bred tabell', value: 'tbl infoTable wide'},
				{title: 'Smal tabell', value: 'infoTable'},
				{title: 'Faktaruta', value: 'facts'}
			],
*/
			style_formats_merge: true,
			style_formats: [
				{title: 'Uppdaterad text', inline: 'span', classes: 'updated'},
				{title: 'Ingress', block: 'p', classes: 'ingress'},
				{title: 'Indenterad första rad', block: 'p', classes: 'indent'},
				{title: 'Stycke med avstånd', block: 'p', classes: 'normal'},
			],
			toolbar1: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image",
			toolbar2: "print preview media | forecolor backcolor emoticons | fontawesome",
			image_advtab: true,
			valid_elements: "*[*]",
			extended_valid_elements: "span[class|style]",
			templates: [
			],
			convert_urls: false
		});

	}
	
});
