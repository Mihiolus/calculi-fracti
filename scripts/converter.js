import * as wordLookups from "./word-lookups.js";
import * as romanLookups from "./roman-lookups.js";

const maxRomanNumeral = 500000;
const undefined = "(<abbr title = 'Non Numerabile'>NN</abbr>)";
const maxWordNumber = 9999999;
const tolerance = 0.000001;

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
        while (num + tolerance >= romanLookups.current[i]) {
            roman += i;
            let oldNum = num;
            num -= romanLookups.current[i];
            if (!isMagnitudeSame(oldNum, num) && getMagnitude(num) >= -1) {
                roman += romanLookups.magnitudeSeparator;
            } else if (num > 0) {
                roman += romanLookups.numeralSeparator;
            }
        }
    }
    if (roman === "") {
        return undefined;
    }
    return roman;
}

function isMagnitudeSame(first, second) {
    return getMagnitude(first) === getMagnitude(second);
}

function getMagnitude(num) {
    return Math.floor(Math.log10(num));
}

export function toWords(arabic) {
    if (arabic === "") {
        return [arabic];
    }
    if (arabic <= 0 || arabic > maxWordNumber) {
        return [undefined];
    }
    var words = [], i, milia = [];
    if (arabic >= 1000000) {
        let hundredsThousands = Math.floor(arabic / 100000);
        words.push(...toAdverbial(hundredsThousands));
        words.push("centum", "milia");
        arabic -= hundredsThousands * 100000;
        if (arabic > 0) {
            words.push("et");
        }
    }
    if (arabic >= 100000) {
        let hundredsThousands = Math.floor(arabic / 100000) * 100;
        milia.push(...toWords(hundredsThousands));
        toNeuter(milia);
        arabic -= hundredsThousands * 1000;
        if (arabic < 2000) {
            milia.push("milia");
        }
    }
    if (arabic >= 2000) {
        let thousands = Math.floor(arabic / 1000);
        if (thousands >= 21 && thousands % 10 === 1) {
            if (milia.length > 0) {
                milia.push("et");
            }
            milia.push("unum", "et");
            thousands -= 1;
            arabic -= 1000;
        }
        milia.push(...toWords(thousands));
        toNeuter(milia);
        milia.push("milia");
        arabic -= thousands * 1000;
    }
    if (arabic / 1000 >= 1) {
        words.push("mille");
        arabic -= 1000;
        if (milia.length > 0) {
            words.push("et");
        }
    }
    words.push(...milia);

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
        if (arabic + tolerance >= wordLookups.fractionsNominative[i]) {
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
    if (words.length === 0) {
        return [undefined];
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