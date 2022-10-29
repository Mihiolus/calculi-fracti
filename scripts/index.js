arabicOutput = "";
arabicExpression = [];
newInput = false;
hasComma = false;
arabicVisible = true;
wordVisible = true;

const minusSign = "−";
const multiplySign = "×";
const divideSign = "÷";

large_lookups = {
    apostr: {
        CCCIↃↃↃ: 100000,
        IↃↃↃ: 50000,
        CCIↃↃ: 10000,
        IↃↃ: 5000,
        CIↃ: 1000,
        CCIↃ: 900
    },
    apostr_tight: {
        ↈ: 100000,
        ↇ: 50000,
        ↂ: 10000,
        ↁ: 5000,
        ↀ: 1000,
        Cↀ: 900
    },
    vincul: {
        '<span style="border-top:1px solid;">C</span>': 100000,
        '<span style="border-top:1px solid;">L</span>': 50000,
        '<span style="border-top:1px solid;">X</span>': 10000,
        '<span style="border-top:1px solid;">V</span>': 5000,
        '<span style="border-top:1px solid;">I</span>': 1000,
        'C<span style="border-top:1px solid;">I</span>': 900
    },
    vincul_with_m: {
        '<span style="border-top:1px solid;">C</span>': 100000,
        '<span style="border-top:1px solid;">L</span>': 50000,
        '<span style="border-top:1px solid;">X</span>': 10000,
        '<span style="border-top:1px solid;">V</span>': 5000,
        M: 1000,
        CM: 900
    }
}
base_lookup = {
    '\u0110': 500,
    'C\u0110': 400,
    C: 100,
    XC: 90,
    L: 50,
    XL: 40,
    X: 10,
    IX: 9,
    V: 5,
    IV: 4,
    I: 1,
    S: 0.5,
    '⁙': 5 / 12,
    '∷': 1 / 3,
    '∴': 1 / 4,
    ':': 1 / 6,
    '·': 1 / 12,
    'Є': 1 / 24,
    '\u{10193}\u{10193}': 1 / 36,
    Ͻ: 1 / 48,
    '\u{10193}': 1 / 72,
    '\u{10194}': 1 / 144,
    Э: 1 / 288
}
lookup = { ...large_lookups.vincul_with_m, ...base_lookup }

if (localStorage.getItem("large-style")) {
    document.querySelector("#vincul_with_m").checked = false;
    let storedStyle = localStorage.getItem("large-style");
    lookup = { ...large_lookups[storedStyle], ...base_lookup }
    document.querySelector(`#${storedStyle}`).checked = true;
}

decimal_places = 6;

let calc = document.querySelector("#calc");
document.addEventListener('keydown', processKey);
Array.from(calc.querySelectorAll("input")).forEach(
    i => i.addEventListener('keydown', preventEnter)
);

function processKey(event) {
    if (event.key >= '0' && event.key <= '9' || event.key == '.') {
        store(event.key);
    } else if (event.key == '+' || event.key == '-' ||
        event.key == '*' || event.key == '/') {
        var converted_operand = inverse_convert_operands(event.key);
        add_operand(converted_operand);
    } else if (event.key == 'Backspace') {
        backspace();
    } else if (event.key == 'Escape') {
        clr();
    } else if (event.key == 'Enter') {
        solve();
    }
}

function preventEnter(event) {
    if (event.key == "Enter") {
        event.preventDefault();
    }
}

function store(value) {
    if (newInput) {
        clr();
        newInput = false;
    }
    if (value == '.') {
        if (hasComma) {
            return;
        } else {
            hasComma = true;
        }
    }
    arabicOutput += value;
    setArabicOutput(arabicOutput);
    setRomanOutput(convert(arabicOutput));
    setWordOutput(toWords(arabicOutput));
}
function change_style(value) {
    lookup = { ...large_lookups[value], ...base_lookup }
    updateRomanDisplays();
    localStorage.setItem("large-style", value);
}
function updateRomanDisplays() {
    setRomanOutput(convert(arabicOutput));
    let romanExpression = [];
    for (var i = 0; i < arabicExpression.length; i++) {
        if (isNumber(arabicExpression[i])) {
            romanExpression.push(convert(arabicExpression[i]));
        } else {
            romanExpression.push(arabicExpression[i]);
        }
    }
    setRomanExpression(romanExpression.join(''));
}
function updateArabicDisplays() {
    setArabicOutput(arabicOutput);
    setArabicExpression(arabicExpression);
}

function updateWordDisplays() {
    setWordOutput(toWords(arabicOutput));

    let wordExpression = [];
    switch (arabicExpression[1]) {
        case "+":
            parseAddition(wordExpression);
            break;
        case minusSign:

            break;
        case multiplySign:
            parseMultiplication(wordExpression);
            break;
        case divideSign:

            break;
        default:
            break;
    }
    setWordExpression(wordExpression.join(" "));
}

function parseAddition(wordExpression) {
    for (var i = 0; i < arabicExpression.length; i++) {
        if (isNumber(arabicExpression[i])) {
            wordExpression.push(toWords(arabicExpression[i]));
        } else {
            if (arabicExpression[i] === "+") {
                wordExpression.push("et");
            } else {
                wordExpression.push("sunt");
            }
        }
    }
}

function parseMultiplication(wordExpression) {
    for (var i = 0; i < arabicExpression.length; i++) {
        if (isNumber(arabicExpression[i])) {
            wordExpression.push(toWords(arabicExpression[i]));
        } else {
            if (arabicExpression[i] === multiplySign) {
                wordExpression.push("multiplicata per");
            } else {
                wordExpression.push("fiunt");
            }
        }
    }
}

function isNumber(string) {
    return !isNaN(string);
}
function convert(arabic) {
    var roman = '',
        i,
        num = arabic;
    for (i in lookup) {
        while (num >= lookup[i]) {
            roman += i;
            num -= lookup[i];
        }
    }
    return roman;
}

word_lookup = {
    mille: 1000,
    nongenta: 900,
    octingenta: 800,
    septingenta: 700,
    sescenta: 600,
    quingenta: 500,
    quadringenta: 400,
    trecenta: 300,
    ducenta: 200,
    centum: 100,
    nonaginta: 90,
    octoginta: 80,
    septuaginta: 70,
    sexaginta: 60,
    quinquaginta: 50,
    quadraginta: 40,
    triginta: 30,
    viginti: 20,
    undeviginti: 19,
    duodeviginti: 18,
    septendecim: 17,
    sedecim: 16,
    quindecim: 15,
    quattuordecim: 14,
    tredecim: 13,
    duodecim: 12,
    undecim: 11,
    decem: 10,
    novem: 9,
    octo: 8,
    septem: 7,
    sex: 6,
    quinque: 5,
    quattuor: 4,
    tria: 3,
    duo: 2,
    unum: 1
}

prefixes = {
    unde: -1,
    duode: -2
}

word_lookup_fractions = {
    deunx: 11 / 12,
    dextans: 5 / 6,
    dodrans: 3 / 4,
    bes: 2 / 3,
    septunx: 7 / 12,
    semis: 0.5,
    quincunx: 5 / 12,
    triens: 1 / 3,
    quadrans: 1 / 4,
    sextans: 1 / 6,
    sescuncia: 1 / 8,
    uncia: 1 / 12,
    semuncia: 1 / 24,
    "binae et dimidia sextula": 5 / 144,
    "binae sextulae": 1 / 36,
    sicilicus: 1 / 48,
    sextula: 1 / 72,
    "dimidia sextula": 1 / 144,
    scripulum: 1 / 288
}

word_lookup_adverbial = {
    millies: 1000,
    centies: 100,
    nonagies: 90,
    octogies: 80,
    sepuagies: 70,
    sexagies: 60,
    quinquagies: 50,
    quadragies: 40,
    tricies: 30,
    vicies: 20,
    terdecies: 13,
    duodecies: 12,
    undecies: 11,
    decies: 10,
    novies: 9,
    octies: 8,
    septies: 7,
    sexies: 6,
    quinquies: 5,
    quater: 4,
    ter: 3,
    bis: 2,
    semel: 1
}

function toWords(arabic) {
    var words = [], i;
    if (arabic >= 2000) {
        let thousands = Math.floor(arabic / 1000);
        words.push(toWords(thousands));
        words.push("millia");
        arabic -= thousands * 1000;
    }
    for (i in word_lookup) {
        if (arabic >= word_lookup[i]) {
            words.push(i);
            arabic -= word_lookup[i];
        } else if (arabic >= 18 && arabic < 98) {
            for (j in prefixes) {
                if (arabic >= word_lookup[i] + prefixes[j]) {
                    words.push(j + i);
                    arabic -= word_lookup[i] + prefixes[j];
                }
            }
        }
    }
    var fractional = [];
    for (i in word_lookup_fractions) {
        if (arabic >= word_lookup_fractions[i]) {
            fractional.push(i);
            arabic -= word_lookup_fractions[i];
        }
    }

    if (fractional.length > 0) {
        if (words.length > 0) {
            words.push("et");
        }
        words.push(fractional.join(" et "));
    }
    return words.join(" ");
}

function setWordOutput(value) {
    document.getElementById("output_word").innerHTML = value;
}

function clr() {
    setRomanOutput("");
    setRomanExpression("");
    arabicOutput = "";
    setArabicOutput("");
    setArabicExpression("");
    setWordOutput("");
    setWordExpression("");
    hasComma = false;
    arabicExpression = [];
}
function backspace() {
    arabicOutput = arabicOutput.slice(0, -1);
    setArabicOutput(arabicOutput);
    setRomanOutput(convert(arabicOutput));
}
function setRomanOutput(value) {
    document.getElementById("output_roman").innerHTML = value;
}
function setRomanExpression(value) {
    document.getElementById("expression_roman").innerHTML = value;
}
function setArabicOutput(value) {
    document.getElementById("output_arabic").innerHTML = arabicOutput;
}
function setArabicExpression(value) {
    let expressionElement = document.getElementById("expression_arabic");
    if (typeof value === "object") {
        expressionElement.innerHTML = value.join('');
    } else {
        expressionElement.innerHTML = value;
    }
}
function setWordExpression(value) {
    let expressionElement = document.getElementById("expression_word");
    if (typeof value === "object") {
        expressionElement.innerHTML = value.join('');
    } else {
        expressionElement.innerHTML = value;
    }
}
function add_operand(value) {
    if (newInput) {
        var oldOutput = document.getElementById("output_arabic").innerHTML;
        clr();
        store(oldOutput);
    }
    arabicExpression.push(arabicOutput);
    arabicExpression.push(value);
    arabicOutput = "";
    updateRomanDisplays();
    updateArabicDisplays();
    updateWordDisplays();
    hasComma = false;
}
function solve() {
    add_operand('=');
    let result = Function(`'use strict'; return (${convert_operands(arabicExpression.join('')).slice(0, -1)})`)();
    arabicOutput = round(result, decimal_places);
    setArabicOutput(arabicOutput);
    setRomanOutput(convert(result));
    setWordOutput(toWords(result));
    newInput = true;
}
function round(number, precision) {
    return Math.round(number * Math.pow(10, precision)) / Math.pow(10, precision);
}
function convert_operands(expression) {
    expression = expression.replace("−", "-");
    expression = expression.replace("×", "*");
    expression = expression.replace("÷", "/");
    return expression;
}
function inverse_convert_operands(expression) {
    expression = expression.replace("-", "−");
    expression = expression.replace("*", "×");
    expression = expression.replace("/", "÷");
    return expression;
}
function show_arabic() {
    arabicVisible = !arabicVisible;
    let arabics = document.getElementsByClassName("arabic_display");
    for (let i = 0; i < arabics.length; i++) {
        arabics[i].style.display = arabicVisible ? "" : "none";
    }
}
function show_word() {
    wordVisible = !wordVisible;
    let elements = document.getElementsByClassName("word_display");
    for (let i = 0; i < elements.length; i++) {
        elements[i].style.display = wordVisible ? "" : "none";
    }
}