"use strict";exports.id=6963,exports.ids=[6963],exports.modules={40824:a=>{function e(a){var e,t,s,n,r;e={pattern:/\\[\\(){}[\]^$+*?|.]/,alias:"escape"},n=RegExp((s="(?:[^\\\\-]|"+(t=/\\(?:x[\da-fA-F]{2}|u[\da-fA-F]{4}|u\{[\da-fA-F]+\}|0[0-7]{0,2}|[123][0-7]{2}|c[a-zA-Z]|.)/).source+")")+"-"+s),r={pattern:/(<|')[^<>']+(?=[>']$)/,lookbehind:!0,alias:"variable"},a.languages.regex={"char-class":{pattern:/((?:^|[^\\])(?:\\\\)*)\[(?:[^\\\]]|\\[\s\S])*\]/,lookbehind:!0,inside:{"char-class-negation":{pattern:/(^\[)\^/,lookbehind:!0,alias:"operator"},"char-class-punctuation":{pattern:/^\[|\]$/,alias:"punctuation"},range:{pattern:n,inside:{escape:t,"range-punctuation":{pattern:/-/,alias:"operator"}}},"special-escape":e,"char-set":{pattern:/\\[wsd]|\\p\{[^{}]+\}/i,alias:"class-name"},escape:t}},"special-escape":e,"char-set":{pattern:/\.|\\[wsd]|\\p\{[^{}]+\}/i,alias:"class-name"},backreference:[{pattern:/\\(?![123][0-7]{2})[1-9]/,alias:"keyword"},{pattern:/\\k<[^<>']+>/,alias:"keyword",inside:{"group-name":r}}],anchor:{pattern:/[$^]|\\[ABbGZz]/,alias:"function"},escape:t,group:[{pattern:/\((?:\?(?:<[^<>']+>|'[^<>']+'|[>:]|<?[=!]|[idmnsuxU]+(?:-[idmnsuxU]+)?:?))?/,alias:"punctuation",inside:{"group-name":r}},{pattern:/\)/,alias:"punctuation"}],quantifier:{pattern:/(?:[+*?]|\{\d+(?:,\d*)?\})[?+]?/,alias:"number"},alternation:{pattern:/\|/,alias:"keyword"}}}a.exports=e,e.displayName="regex",e.aliases=[]}};