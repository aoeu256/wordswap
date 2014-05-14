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
  var groups = {'CH':true, 'PH':true, 'GH':true, 'SH':true, 'CH':true, 'ZH':true, 'CK':true, 'ER':true, 'NG':true, 'TH':true};
  var vowel = {'A':true, 'E':true, 'I':true, 'O':true, 'U':true};
  var vow2 = {'A':true, 'E':true, 'I':true, 'O':true, 'U':true, 'Y':true, 'W':true};
  function letterGroup(word) {
	var c = 0;
	var lst = [];
	var g = word.toUpperCase();
	while(c<word.length) {
		if(groups[g[c]+g[c+1]]) {
			lst.push(word[c]+word[c+1]);
			c+=2;
		} else if(g[c] === g[c+1]) {
			lst.push(word[c]+word[c+1]);
			c+=2;
		} else if(vowel[g[c]] && vowel[g[c+1]]) {
			lst.push(word[c]+word[c+1]);
			c+=2;
		}
		else {
			lst.push(word[c]);
			c++;
		}
	}
	return lst;
 }
 
 function symbGroup(word) {
	var groups = {'YUW':true};
	var c = 0;
	var lst = [];
	var group;
	while(c <word.length) {
		group = ""+word[c]+word[c+1];
		if(word[c] === 'HH') word[c]='H';
		if(!isNaN(group[group.length-1])) {
			group = group.slice(0, group.length-1);
		}
		if(groups[group]) {
			console.log('YUW');
			lst.push(group);
			c+=2;
		}
		else {
			var ch = word[c];			
			if(!isNaN(ch[ch.length-1])) lst.push(ch.slice(0, ch.length-1));
			else lst.push(ch);
			c++;
		}
	}
	return lst;
 }
/*
ĉ ĝ ĥ ĵ ŝ ŭ 
Ĉ Ĝ Ĥ Ĵ Ŝ Ŭ 
Ĉ Ĝ Ĥ Ĵ Ŝ Ŭ 
ĉ ĝ ĥ ĵ ŝ ŭ

 */
 var cons = {'C': {'K':'^Cg', 'S':'cedil'},  
             'CH':{'CH':'circ', 'K':'^Ĉĉ'},
			 'TH':{'TH':'TH','DH':'^Ðð'},
			 'G':{'G':'^Gg', 'J':'^Ĝĝ'},
			 'S':{'S':'^Ss', 'Z':'cedil'}};
 var vows = {'AH':'uml',
		 'AE':'tilde',
		 'AA':'acute', // *
		 'AO':'', // nani kore?
		 'EY':'circ',			 
		 'IH':'grave', // 3 *
		 'IY':'circ',
		 'AY':'circ',
		 'ER':'',
		 'OW':'circ',
		 'EH':'acute',
		 'UW':'acute',
		 'YUW':'circ'};
 function compareMod(group, phon) {
	var cgr = group.toUpperCase();
	console.log('comp:'+cgr+'->'+phon+' '+' ');
    var p = phon;	

	if(vows[p]) {
		if(!isVowels(cgr))
			return 'SKIP';
		return vows[p];		
	}
	else if(cons[cgr] && cons[cgr][phon]) {
		console.log('KONS');
		return cons[cgr][phon];
	}
	else if(group.length===2 && cgr[0]===cgr[1]) {
		if(cgr[0] !== phon)
			return 'SKIP';
		return '';
	}
	else {
		if(cgr !== phon) return 'SKIP';
		return '';
	}
 }
 
 function modWord(_w, mod) {
	var w = _w;
	if(mod[0] === '*') {
		w = mod.slice(1);
		mod = mod.slice(2);
	}
	else if(mod[0] === '^') {
		if(w.toUpperCase() === w)
			w[0] = mod[1];
		else
			w[0] = mod[2];
		mod = '';
	}
	if(mod === '') return w;
	else {
		if(w.length == 1)
			return '&'+w+mod+';';
		else if(isVowels(w)) {
			return '&'+w[0]+mod+';' + '&'+w[1]+mod+';';
		}
		else
			return '&'+w[0]+mod+';'+w[1];
	}
 }
 
 function isVowels(b) {
	var vow = toSet('aeiou');
	var g = b.toLowerCase();
	for(var c in g) {
		if(!vow[g[c]])
			return false;
	}
	return true;
 }
 
 function convertWord(_let, _phon) {
	var endword='';
	var letc=0;
	var phonc=0;
	var mod='';
	var let = letterGroup(_let);
	var phon = symbGroup(_phon);
	console.log('phon is'+phon);
	while(letc < let.length) {
		mod = compareMod(let[letc], phon[phonc]);
		if(mod !== 'SKIP') {
			
			endword += modWord(let[letc],mod);
			phonc++;
			console.log('endword='+endword+' '+'NOT SKIP');
		} else {
			if(!isVowels(let[letc]) && phon.length<let.length && phonc<phon.length-1)
				endword += let[letc]+':';
			else
				endword += let[letc];
			console.log('endword='+endword+' '+'SKIP');
		}
		letc++;
	}
	return endword;
 }
 
function toSet(ary) {
	var obj = {};
	for(var i=0; i<ary.length; i++) obj[ary[i]] = true;
	return obj;
}

$(document).ready(function() {
	var dict;
	
	var singleEnds = ["'", "s"];
	var doubleEnds = ["ed", "ic", "'s", "er", "ly"];
	var tripleEnds = ["ing", "est", "ful", "ish", "ity"];
	var quadEnds   = ["less", "able", "ment", "ness", "ally"];
	var vowel = {'a':true, 'e':true, 'i':true, 'o':true, 'u':true};
		
	
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
/*	
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
*/	
	function doString(s) {
		var newBody="";
		var splits = wordsplit(s);
		var splitText = splits[0];
		var seps = splits[1];
		var splitOff = 0;		
		var sep = "";
		
		if(splits[1] > splits[0]) {// splitter is longer
			newBody = splits[1][0];
			splitOff++;
		}
		
		for(var i=0; i<splitText.length; i++) {
			var key = splitText[i].toUpperCase();
			var val = dict[key];
			var text = splitText[i];
			
			if(val) text = convertWord(text, val);
			newBody += text;
			var sep = seps[i+splitOff];
			if(sep || sep === " ") {
				newBody += sep;
			}
		}
		return newBody;
	}

	chrome.extension.sendRequest({"greeting": "getDict"}, function(response) {
		dict = response.data;
		startArray = $('body').contents();
		function recurseSwitch(ary) {
			for(var i=0; i<ary.length; i++) {
				if(!ary[i]) continue;
				if(ary[i].children && ary[i].children.length>0)
					recurseSwitch(ary[i].children);	
				else if (ary[i].innerText && ary[i].innerText != "") { // && (ary[i].nodeType === 1 || ary[i].nodeType == 3)) {
					ary[i].innerHTML = doString(ary[i].innerHTML);
				}
			}
		}
		recurseSwitch(startArray);
		
		
		//var words = ['HOME', 'FIRST', 'COLOR'];
		for(word in words) {
			console.log(convertWord(words[word], dict[words[word]]));
		}
/*		console.log(elt);
		console.log(keys(elt));
		console.log(elt.text());
		console.log(elt.nodeType);*/
	});
});