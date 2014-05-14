function _is_valid_character(ch)
{
	if(!ch || (typeof ch != "string" || ch.length != 1))
	  return false;

	var code = ch.charCodeAt(0);
	
	// this is A-Za-z0-9 and apostrophes
	return ((code >= 48 && code <= 57) || (code >= 65 && code <= 90)  ||
	        (code >= 97 && code <= 122) || (code >= 138 && code <= 142) ||
			(code >= 154 && code <= 159) || (code >= 192 && code <= 255));
			// code == 44
}

function keys(obj) {
    var ary = [];
	for(var prop in obj) {
        ary.push(prop);
    }
    return ary;
}

function wordsplit(s) {
	var curToken = "";
	var curSplitter = "";
	var tokens = [];
	var splitter = [];
	for(var c=0; c<s.length; c++) {
		if (_is_valid_character(s[c])) {
			curToken += s[c];
			if(curSplitter) splitter.push(curSplitter);
			curSplitter = "";
		}
			
		else {
			curSplitter += s[c];
			if(curToken) tokens.push(curToken);
			curToken = "";
		}
	}
	if(curSplitter) splitter.push(curSplitter);
	if(curToken) tokens.push(curToken);
		
	return [tokens, splitter];
}

$(document).ready(function() {
	var dict;
	
	/*
	var singleEnds = ["'", "s"];
	var doubleEnds = ["ed", "ic", "'s", "er", "ly"];
	var tripleEnds = ["ing", "est", "ful", "ish", "ity"];
	var quadEnds   = ["less", "able", "ment", "ness", "ally"];*/
	var vowel = {'a':true, 'e':true, 'i':true, 'o':true, 'u':true};
		
	function toSet(ary) {
		var obj = {};
		for(var i=0; i<ary.length; i++) obj[ary[i]] = true;
		return obj;
	}
	
	var endingsDict = [singleEnds, doubleEnds, tripleEnds, quadEnds];
	for(var i=0; i<endingsDict.length; i++) endingsDict[i] = toSet(endingsDict[i]);
	
	function replaceVowel(text, symbols) {
		var symb = symbols[Math.floor(Math.random()*symbols.length)];
		for(var c=0; c<text.length; c++) { // first Vowel
			if(vowel[text[c]]) {
				text = text.substr(0, c) + symb + text.substr(c+1, text.length);
				break;
			}
		}
		return text;
	}
	
	function rootWord(key) {
		if (dict[key]) 
			return key;
		
		var nkey;
		for(var end=0; end<endingsDict.length && end<key.length-2; end++) { // truncate endings
			ending = key.substr(key.length-end-1, key.length);
			if(endingsDict[end][ending]) {
				var nkey = key.substr(0, key.length-end-1);
				if(key[key.length-1] === 'i')
					nkey = key.substr(0, key.length-1) + "y";
					
				if(dict[nkey])
					break;
				nkey += "e";
				if(dict[nkey])
					break;
			}
		}
		return nkey;
	}
	
	function doString(s) {
		var newBody="";
		var splits = wordsplit(s);
		var splitText = splits[0];
		var seps = splits[1];
		var splitOff = 0;		
		var sep = "";
		console.log('splits is '+splits[1].toString());
		
		if(splits[1] > splits[0]) {// splitter is longer
			newBody = splits[1][0];
			splitOff++;
		}
		
		for(var i=0; i<splitText.length; i++) {
			var key = rootWord(splitText[i].toLowerCase());
			var val = dict[key];
			var text = splitText[i];
			
			if(val) text = replaceVowel(text, val);
			newBody += text;
			var sep = seps[i+splitOff];
			if(sep || sep === " ") {
				newBody += sep;
			}
		}
		return newBody;
	}

	chrome.extension.sendRequest({"greeting": "getDict"}, function(response) {
		console.log('is this on');
		dict = response.data;
		startArray = $('body').contents();
		console.log(startArray);
		function recurseSwitch(ary) {
			for(var i=0; i<ary.length; i++) {
				if(!ary[i]) continue;
				if(ary[i].children && ary[i].children.length>0)
					recurseSwitch(ary[i].children);	
				else if (ary[i].innerText && ary[i].innerText != "") { // && (ary[i].nodeType === 1 || ary[i].nodeType == 3)) {
					ary[i].innerText = doString(ary[i].innerText);
				}
			}
		}
		recurseSwitch(startArray);
		
/*		console.log(elt);
		console.log(keys(elt));
		console.log(elt.text());
		console.log(elt.nodeType);*/
	});
});