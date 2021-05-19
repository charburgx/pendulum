let _mu = 0.1
let _L = 2
let _samples = 100
let _fieldrange = 50

$(document).ready(function() {
	$('#mu').range({
		min: 0,
		max: 1,
		start: _mu,
		step: 0.01,
		onChange: function(val) { setMu(val) }
	});
});

$(document).ready(function() {
	$('#L').range({
		min: 0.01,
		max: 10,
		start: _L,
		step: 0.01,
		onChange: function(val) { setL(val) }
	});
});

$(document).ready(function() {
	$('#samples').range({
		min: 0.5,
		max: 1000,
		step: 0.001,
		start: _samples,
		onChange: function(val) { setSamples(val) }
	});
});

$(document).ready(function() {
	$('#fieldrange').range({
		min: 0,
		max: 100,
		step: 1,
		start: _fieldrange
	});
});

function fieldVisibility(e) {
	//console.log(e.checked)
	showVectorField(e.checked)
}

function pendulumVisibility(e) {
	showPview(e.checked)
}

function setMu(m) { _mu = m; refreshFieldL(); }
function setL(l) { _L = l;  refreshFieldL(); }
function setSamples(s) { _samples = s }

function mu() { return _mu }
function L() { return _L }
function dt() { return (1 / _samples); }

function refreshFieldL() { if(typeof refreshField != "undefined") { refreshField(); } }