//string format function
String.prototype.format = function() {
	var args = arguments;
	return this.replace(/{(\d+)}/g, function(match, number) {
		return typeof args[number] != 'undefined' ? args[number] : match;
	});
};
var scHandler = {
	getMediaLink : function(trackData, callback) {
		$.ajax({
			url : trackData.permalink_url,
			type : 'GET',
			dataType : 'text',
			success : function(res) {
				var p = res.responseText.indexOf('"streamUrl":"') + ('"streamUrl":"').length;
				var mediaUrl = res.responseText.substring(p, res.responseText.indexOf('"', p));

				callback(mediaUrl);
			}
		});

		return this;
	},
	getTracksForUser : function(userId) {
		var self = this;

		$.getJSON(this.apiUserTracksUrl.format(userId), function(tracks) {
			this.currentTracks = tracks;
		});
	},
	generateSignature : function() {
		if(this.currentTracks) {
			this.getMediaLink(this.currentTracks[i], function(url) {
				self.getSliver(url);
			});
		}
	},
	getSliver : function(url) {
		var proxyUrl = "./php/proxy.php?url=" + url + "&mode=native";

		// Load asynchronously
		var request = new XMLHttpRequest();
		request.open("GET", proxyUrl, true);
		request.responseType = "arraybuffer";

		this.request && this.request.abort();
		this.request = request;

		request.onprogress = function(ev) {

		};

		request.onload = function() {
			if(request.readyState != 4)
				return;

			context.decodeAudioData(request.response, function(buffer) {
				self.buffer = buffer;
				self.loaded();
			});
		}

		request.onerror = function() {
			alert("error.");
		}

		request.send();
	}
};

$(document).ready(function() {
	$("#usernameTextInput").autocomplete({
		source : function(request, response) {
			$.getJSON('http://api.soundcloud.com/users.json', {
				q : request.term,
				client_id : '3818f234c5565fd0c330e96416c129cb'
			}).done(function(users) {
				response($.map(users, function(user) {
					return {
						label : user.username,
						value : user.username,
						id : user.id
					}
				}));
			});
		},
		minLength : 2,
		select : function(event, ui) {
			scHandler.getTracksForUser(ui.item.id);
		}
	});

	$("#generateSignature").mousedown(function(e) {
		$(this).addClass("gradient");
		$(this).removeClass("gradientReverse");
		scHandler.generateSignature();
	});

	$("#generateSignature").mouseup(function(e) {
		$(this).removeClass("gradient");
		$(this).addClass("gradientReverse");
	});
});
