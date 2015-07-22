var fields = ['default-src', 'connect-src', 'font-src', 'img-src', 'media-src', 'object-src', 'script-src', 'style-src', 'frame-src'];
var format = 'apache';
var elmList, elmOutput;

function fillInput(config) {
	elmList.forEach(function (elm) {
		if (elm.id in config) {
			elm.value = config[elm.id].replace(/\s+/g, '\n');
		}
	});

	onInputChange();
}

function parseConfig(pattern, config) {
	var match = pattern.exec(config);
	if (match && match.length > 0) {
		var obj = {}, firstSpacePos;
		match[1].split(';').forEach(function (item) {
			item = item.trim();
			firstSpacePos = item.indexOf(' ');
			obj[item.substring(0, firstSpacePos)] = item.substr(firstSpacePos + 1);
		});
		return obj;
	}
}

function parseApache(config) {
	var pattern = /^\s*Header\s(?:always\s)?(?:set|append|merge|add)\sContent-Security-Policy\s"(.+)"/mi;
	fillInput(parseConfig(pattern, config));
	setRadioChecked('apache');
}

function parseNginx(config) {
	var pattern = /^\s*add_header\sContent-Security-Policy\s"(.+)"/mi;
	fillInput(parseConfig(pattern, config));
	setRadioChecked('nginx');
}

function parseIis(config) {
	var pattern = /<add name="Content-Security-Policy" value="(.+)"/mi;
	fillInput(parseConfig(pattern, config));
	setRadioChecked('iis');
}

function parseFile(file, result) {
	var config = window.atob(result.substr(result.indexOf(',') + 1));
	if (config.indexOf('add_header') > -1) {
		parseNginx(config);
	} else if (config.indexOf('Header') > -1) {
		parseApache(config);
	} else if (config.indexOf('name="Content-Security-Policy"') > -1) {
		parseIis(config);
	}
	autosize.update(elmList);
}

function onFileChange(files) {
	if (files.length === 0) return;

	var file = files[0];
	var reader = new FileReader();

	reader.onloadend = function () {
		parseFile(file, reader.result);
	};

	reader.readAsDataURL(file);
}

function setRadioChecked(value) {
	var elm = document.querySelector('input[value=' + value + ']');
	elm.checked = true;
}

function formatInput(text) {
	return text.split(/\n/).sort().join(' ');
}

function formatOutput(outputList) {
	if (format === 'apache') {
		return formatApache(outputList);
	} else if (format === 'nginx') {
		return formatNginx(outputList);
	} else if (format === 'iis') {
		return formatIis(outputList);
	}
}

function formatApache(cspList) {
	return 'Header set Content-Security-Policy' + ' "' + cspList.join('; ') + '"';
}

function formatNginx(cspList) {
	return 'add_header Content-Security-Policy' + ' "' + cspList.join('; ') + '"';
}

function formatIis(cspList) {
	return '<add name="Content-Security-Policy" value="' + cspList.join('; ') + '" />';
}

function onRadioChange(radio) {
	format = radio.value;
	onInputChange();
}

function onInputChange() {
	var outputList = elmList.map(function (curr) {
		var val = formatInput(curr.value);
		if (val.length) {
			return curr.id + ' ' + val;
		}
	}).filter(function (item) {
		return !!item;
	});
	elmOutput.value = formatOutput(outputList);
}

function init() {
	elmOutput = document.getElementById('csp-output');

	elmOutput.addEventListener('click', function () {
		this.select();
	});

	elmList = fields.map(function (id) {
		return document.getElementById(id);
	});

	elmList.forEach(function (elm) {
		elm.addEventListener('change', onInputChange);
	});

	autosize(elmList);

	fillInput({
		'default-src': '\'self\''
	});
}

document.addEventListener('DOMContentLoaded', init);