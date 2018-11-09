(function(window) {
	var HAS_HASHCHANGE = (function() {
		var doc_mode = window.documentMode;
		return ('onhashchange' in window) &&
			(doc_mode === undefined || doc_mode > 7);
	})();

	L.Hash = function(map) {
		this.onHashChange = L.Util.bind(this.onHashChange, this);

		if (map) {
			this.init(map);
		}
	};

	L.Hash.parseHash = function(hash) {
		if(hash.indexOf('#') === 0) {
			hash = hash.substr(1);
		}
		var args = hash.split("/");
		if (args.length == 5) {
			var seed = parseInt(args[0], 10),
				zoom = parseInt(args[1], 10),
				lat = parseFloat(args[2]),
				lon = parseFloat(args[3]);
				depth = parseFloat(args[4]);
			if (isNaN(zoom) || isNaN(lat) || isNaN(lon)) {
				return false;
			} else {
				return {
					center: new L.LatLng(lat, lon),
					zoom: zoom,
					seed: seed,
					depth: depth
				};
			}
		} else {
			return false;
		}
	};

	L.Hash.formatHash = function(map) {
		var seed = map._p5_seed,
			depth = map._p5_depth,
			center = map.getCenter(),
		    zoom = map.getZoom(),
		    precision = 12;
		    // precision = Math.max(0, Math.ceil(Math.log(zoom*zoom) / Math.LN2));

		return "#" + [seed, zoom,
			center.lat.toFixed(precision),
			center.lng.toFixed(precision),
			depth.toFixed(precision)
		].join("/");
	},

	L.Hash.prototype = {
		map: null,
		lastHash: null,

		parseHash: L.Hash.parseHash,
		formatHash: L.Hash.formatHash,

		init: function(map) {
			this.map = map;

			// reset the hash
			this.lastHash = null;
			this.onHashChange();

			if (!this.isListening) {
				this.startListening();
			}
		},

		removeFrom: function(map) {
			if (this.changeTimeout) {
				clearTimeout(this.changeTimeout);
			}

			if (this.isListening) {
				this.stopListening();
			}

			this.map = null;
		},

		onMapMove: function() {
			// bail if we're moving the map (updating from a hash),
			// or if the map is not yet loaded

			if (this.movingMap || !this.map._loaded) {
				return false;
			}

			var hash = this.formatHash(this.map);
			if (this.lastHash != hash) {
				location.replace(hash);
				this.lastHash = hash;
			}
		},

		movingMap: false,
		update: function() {
			var hash = location.hash;
			if (hash === this.lastHash) {
				return;
			}
			var parsed = this.parseHash(hash);
			if (parsed) {
				var do_reset = false;
				if (!("_hash_parsed" in this.map)) {
					do_reset = true;
				}
				this.map._hash_parsed = true;
				this.map._p5_seed = parsed.seed;
				this.map._p5_depth = parsed.depth;

				this.movingMap = true;

				this.map.setView(parsed.center, parsed.zoom, {reset: do_reset});

				this.movingMap = false;
			}
			else if (!("_hash_parsed" in this.map)) {
				this.map._hash_parsed = true;
				var center = this.map.getCenter();
				var zoom = this.map.getZoom();
				this.map.setView(center, zoom, {reset: true});
			}
			else {
				this.onMapMove(this.map);
			}
		},

		// defer hash change updates every 100ms
		changeDefer: 100,
		changeTimeout: null,
		onHashChange: function() {
			// throttle calls to update() so that they only happen every
			// `changeDefer` ms
			if (!this.changeTimeout) {
				var that = this;
				this.changeTimeout = setTimeout(function() {
					that.update();
					that.changeTimeout = null;
				}, this.changeDefer);
			}
		},

		isListening: false,
		hashChangeInterval: null,
		startListening: function() {
			this.map.on("moveend", this.onMapMove, this);

			if (HAS_HASHCHANGE) {
				L.DomEvent.addListener(window, "hashchange", this.onHashChange);
			} else {
				clearInterval(this.hashChangeInterval);
				this.hashChangeInterval = setInterval(this.onHashChange, 50);
			}
			this.isListening = true;
		},

		stopListening: function() {
			this.map.off("moveend", this.onMapMove, this);

			if (HAS_HASHCHANGE) {
				L.DomEvent.removeListener(window, "hashchange", this.onHashChange);
			} else {
				clearInterval(this.hashChangeInterval);
			}
			this.isListening = false;
		}
	};
	L.hash = function(map) {
		return new L.Hash(map);
	};
	L.Map.prototype.addHash = function() {
		this._hash = L.hash(this);
	};
	L.Map.prototype.removeHash = function() {
		this._hash.removeFrom();
	};
})(window);

String.prototype.hashCode = function() {
  var hash = 0, i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

function getRandomValue(p5, x, y, z, name, min, max, scale) {
  let hashNumber = name.hashCode();
  let noiseVal = p5.noise(x * scale, y * scale, (z + hashNumber));
  return p5.map(noiseVal, 0, 1, min, max);
}
