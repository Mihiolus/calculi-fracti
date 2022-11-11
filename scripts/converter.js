import * as wordLookups from "./word-lookups.js";
import * as romanLookups from "./roman-lookups.js";

export function toRoman(arabic) {
    var roman = '',
        i,
        num = arabic;
    for (let i in romanLookups.current) {
        while (num >= romanLookups.current[i]) {
            roman += i;
            num -= romanLookups.current[i];
        }
    }
    return roman;
}

export function toWords(arabic) {
    var words = [], i;
    if (arabic >= 1000000) {
        let hundredsThousands = Math.floor(arabic / 100000);
        words.push(...toAdverbial(hundredsThousands));
        words.push("centum");
        arabic -= hundredsThousands * 100000;
        if (arabic < 1000) {
            words.push("millia");
        } else if (arabic < 2000) {
            words.push("et", "unum");
        }
    }
    if (arabic >= 2000) {
        let thousands = Math.floor(arabic / 1000);
        words.push(...toWords(thousands));
        toNeuter(words);
        if (words[words.length - 1] === "unum") {
            words.push("mille");
        } else {
            words.push("millia");
        }
        arabic -= thousands * 1000;
    }
    for (let i in wordLookups.integersNominative) {
        if (arabic >= wordLookups.integersNominative[i]) {
            words.push(i);
            arabic -= wordLookups.integersNominative[i];
        } else if (arabic >= 18 && arabic < 98) {
            for (let j in wordLookups.prefixes) {
                if (arabic >= wordLookups.integersNominative[i] + wordLookups.prefixes[j]) {
                    words.push(j + i);
                    arabic -= wordLookups.integersNominative[i] + wordLookups.prefixes[j];
                }
            }
        }
    }
    var fractional = [];
    for (let i in wordLookups.fractionsNominative) {
        if (arabic >= wordLookups.fractionsNominative[i]) {
            fractional.push(i);
            arabic -= wordLookups.fractionsNominative[i];
        }
    }

    if (fractional.length > 0) {
        if (words.length > 0) {
            words.push("et");
        }
        for (let i = 0; i < fractional.length; i++) {
            words.push(fractional[i]);
            if (i === fractional.length - 1) {
                break;
            }
            words.push("et");
        }
    }
    return words;
}

export function toAccusative(nominative) {
    convertCase(nominative, wordLookups.integersAccusative, wordLookups.fractionsAccusative);
}

export function toAblative(nominative) {
    convertCase(nominative, wordLookups.integersAblative, wordLookups.fractionsAblative);
}

function convertCase(nominative, integerLookup, fractionalLookup) {
    for (let i = 0; i < nominative.length; i++) {
        let w = nominative[i];
        if (integerLookup[w]) {
            nominative[i] = integerLookup[w];
        }
        if (fractionalLookup[w]) {
            nominative[i] = fractionalLookup[w];
        }
    }
}

function toNeuter(wordArray) {
    for (let i = 0; i < wordArray.length; i++) {
        let w = wordArray[i];
        if (wordLookups.integersNeuter[w]) {
            wordArray[i] = wordLookups.integersNeuter[w];
        }
    }
}

function toAdverbial(arabic) {
    var words = [];
    for (let i in wordLookups.adverbial) {
        if (arabic >= wordLookups.adverbial[i]) {
            if (wordLookups.adverbial[i] < 10) {
                words.splice(words.length - 2, 0, i, "et");
            } else {
                words.push(i);
            }
            arabic -= wordLookups.adverbial[i];
        } else if (arabic >= 18 && arabic < 98) {
            for (let j in wordLookups.prefixes) {
                if (arabic >= wordLookups.adverbial[i] + wordLookups.prefixes[j]) {
                    words.push(j + i);
                    arabic -= wordLookups.adverbial[i] + wordLookups.prefixes[j];
                }
            }
        }
    }
    return words;
}