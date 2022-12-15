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
        num = Number(arabic);
    for (let i in romanLookups.current) {
        while (num + tolerance >= romanLookups.current[i]) {
            roman += i;
            let oldNum = num;
            num -= romanLookups.current[i];
            if (!isMagnitudeSame(oldNum, num) && !(getMagnitude(oldNum) === 1 && getMagnitude(num) === 0) && getMagnitude(num) >= -1) {
                roman += romanLookups.magnitudeSeparator;
            } else if (num > 10) {
                roman += romanLookups.numeralSeparator;
            }
        }
    }
    if (roman === "") {
        return undefined;
    }
    return roman;
}

export function isDecimal(string) {
    return !isNaN(string) && string % 1 !== 0;
}

export function isFraction(string) {
    if (typeof string !== "string") {
        return false;
    }
    if (isDecimal(string)) {
        return false;
    }
    if (string.indexOf('/') < 0) {
        return false;
    }
    return true;
}

export function toFraction(string) {
    if (!isDecimal(string)) {
        return string;
    }
    var n = Number(string);
    var numerator = Math.floor(n * 288);
    var denominator = 288;
    [numerator, denominator] = reduce(numerator, denominator);
    return `${numerator}/${denominator}`;
}

export function toDecimal(fraction, decimalPlaces = 15) {
    if (!isNaN(fraction)) {
        return fraction;
    }
    let slashPos = fraction.indexOf('/');
    if (slashPos < 0) {
        return NaN;
    }
    let split = fraction.split('/');
    return String(bankersRound(split[0] / split[1], decimalPlaces));
}

function bankersRound(number, decimalPlaces) {
    number *= Math.pow(10, decimalPlaces);
    const floor = Math.floor(number);
    var diff = number - floor;
    if (diff > 0.5 + Number.EPSILON || diff < 0.5 - Number.EPSILON) {
        number = Math.round(number);
    } else {
        if (floor % 2 === 0) {
            number = floor;
        } else {
            number = floor + 1;
        }
    }
    return number / Math.pow(10, decimalPlaces);
}

function reduce(numerator, denominator) {
    var gcd = function gcd(a, b) {
        return b ? gcd(b, a % b) : a;
    };
    gcd = gcd(numerator, denominator);
    return [numerator / gcd, denominator / gcd];
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
    arabic = Number(arabic);
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

function toAccusative(nominative) {
    convertCase(nominative, wordLookups.integersAccusative, wordLookups.fractionsAccusative);
}

function toAblative(nominative) {
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

export function additionToWords(arabicExpression) {
    var wordExpression = [];
    for (let i = 0; i < arabicExpression.length; i++) {
        if (!isNaN(arabicExpression[i])) {
            wordExpression.push(...toWords(arabicExpression[i]));
        } else {
            if (arabicExpression[i] === "+") {
                wordExpression.push("et");
            } else {
                wordExpression.push("sunt");
            }
        }
    }
    return wordExpression;
}

function isEndingPlural(wordArray) {
    var result = true;
    console.log(wordArray);
    for (let i in wordLookups.genders) {
        if (i === wordArray[wordArray.length - 1]) {
            console.log(`${wordArray[wordArray.length - 1]}, ${i}, ${wordLookups.genders[i]}`);
            if (!wordLookups.genders[i].includes('pl')) {
                result = false;
            }
            break;
        }
    }
    return result;
}

function pushInflected(expression, inflectionSource, wordStart) {
    var gender = "mpl";
    for (let i in wordLookups.genders) {
        if (i === inflectionSource[inflectionSource.length - 1]) {
            gender = wordLookups.genders[i];
        }
    }
    expression.push(wordStart + wordLookups.participleEndings[gender]);
}

export function subtractionToWords(arabicExpression) {
    var wordExpression = [];

    wordExpression.push("de");
    let first = toWords(arabicExpression[0]);
    toAblative(first);
    wordExpression.push(...first);
    if (arabicExpression.length < 3) {
        wordExpression.push("deducti");
        return wordExpression;
    }
    let second = toWords(arabicExpression[2]);

    pushInflected(wordExpression, second, "deduct");
    wordExpression.push(...second);

    if (isEndingPlural(second)) {
        wordExpression.push("fiunt");
    } else {
        wordExpression.push("fit");
    }

    return wordExpression;
}

export function multiplicationToWords(arabicExpression) {
    var wordExpression = [];

    wordExpression.push(...toWords(arabicExpression[0]));

    var endingPlural = isEndingPlural(wordExpression);

    pushInflected(wordExpression, wordExpression, "multiplicat");
    wordExpression.push("per");

    if (arabicExpression.length < 3) {
        return wordExpression;
    }
    const secondNumber = toWords(arabicExpression[2]);
    toAccusative(secondNumber);
    wordExpression.push(...secondNumber);
    if (endingPlural) {
        wordExpression.push("fiunt");
    } else {
        wordExpression.push("fit");
    }

    return wordExpression;
}

export function divisionToWords(arabicExpression) {
    var wordExpression = [];

    wordExpression.push(...toWords(arabicExpression[0]));

    var endingPlural = isEndingPlural(wordExpression);

    pushInflected(wordExpression, wordExpression, "divis");
    wordExpression.push("in");

    if (arabicExpression.length < 3) {
        return wordExpression;
    }

    let second = toWords(arabicExpression[2]);
    toAccusative(second);
    wordExpression.push(...second);

    if (endingPlural) {
        wordExpression.push("fiunt");
    } else {
        wordExpression.push("fit");
    }

    return wordExpression;
}