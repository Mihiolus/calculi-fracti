import * as wordLookups from "./word-lookups.js";
import * as romanLookups from "./roman-lookups.js";

const maxRomanNumeral = 500000;
const undefined = "<abbr title = 'Non Numerabile'>NN</abbr>";
const maxWordNumber = 9999999;

export function toRoman(arabic) {
    if (arabic === "") {
        return arabic;
    }
    if (arabic <= 0 || arabic > maxRomanNumeral) {
        return undefined;
    }
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
    if (arabic === "") {
        return [arabic];
    }
    if (arabic <= 0 || arabic > maxWordNumber) {
        return [undefined];
    }
    var words = [], i, centumMilia = [], millia = [];
    if (arabic >= 1000000) {
        let hundredsThousands = Math.floor(arabic / 100000);
        centumMilia.push(...toAdverbial(hundredsThousands));
        centumMilia.push("centum", "millia");
        arabic -= hundredsThousands * 100000;
    }
    if (arabic >= 100000) {
        let hundredsThousands = Math.floor(arabic / 100000) * 100;
        millia.push(...toWords(hundredsThousands));
        toNeuter(millia);
        arabic -= hundredsThousands * 1000;
    }
    if (arabic >= 2000) {
        let thousands = Math.floor(arabic / 1000);
        if (thousands >= 21 && thousands % 10 === 1) {
            millia.push("unum", "et");
            thousands -= 1;
            arabic -= 1000;
        }
        millia.push(...toWords(thousands));
        toNeuter(millia);
        millia.push("millia");
        arabic -= thousands * 1000;
    }
    if (arabic / 1000 >= 1 && centumMilia.length > 0) {
        words.push("mille", "et");
        arabic -= 1000;
    }
    words.push(...millia);
    if (millia.length > 0 && centumMilia.length > 0) {
        words.push("et");
    }
    words.push(...centumMilia);
    if (centumMilia.length > 0 && arabic > 0) {
        words.push("et");
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
            if (wordLookups.adverbial[i] === 1) {
                words.splice(words.length - 2, 0, i, "et");
            }
            else if (wordLookups.adverbial[i] < 10) {
                words.splice(words.length - 2, 0, i);
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