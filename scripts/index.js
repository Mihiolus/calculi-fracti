import * as wordLookups from "./word-lookups.js";
import * as romanLookups from "./roman-lookups.js";

var arabicOutput = "";
var arabicExpression = [];
var newInput = false;
var hasComma = false;
var arabicVisible = true;
var wordVisible = true;
var hasOperand = false;

const minusSign = "−";
const multiplySign = "×";
const divideSign = "÷";

if (localStorage.getItem("large-style")) {
    document.querySelector("#vincul_with_m").checked = false;
    let storedStyle = localStorage.getItem("large-style");
    romanLookups.setLargeStyle(storedStyle);
    document.querySelector(`#${storedStyle}`).checked = true;
}

const decimal_places = 6;

document.addEventListener('keydown', processKey);
Array.from(document.querySelectorAll("table > input")).forEach(
    i => i.addEventListener('keydown', preventEnter)
);
for (let num = 0; num < 10; num++) {
    document.querySelector(`[id='${num}']`).addEventListener('click', () => store(num));
}
document.querySelector("#clr").addEventListener('click', () => clr());
document.querySelector("#bksp").addEventListener('click', () => backspace());
document.querySelector(`[id='${divideSign}']`).addEventListener('click', () => add_operand(divideSign));
document.querySelector(`[id='${multiplySign}']`).addEventListener('click', () => add_operand(multiplySign));
document.querySelector(`[id='${minusSign}']`).addEventListener('click', () => add_operand(minusSign));
document.querySelector(`[id='+']`).addEventListener('click', () => add_operand("+"));
document.querySelector(`[id='.']`).addEventListener('click', () => store("."));
document.querySelector("[id='=']").addEventListener('click', () => add_operand("="));

Array.from(document.querySelectorAll("input[name='large_style']")).forEach(
    elem => elem.addEventListener('click', (ev) => change_style(elem.id))
)

document.querySelector("#show_arabic").addEventListener('click', show_arabic);
document.querySelector("#show_word").addEventListener('click', show_word);

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
        add_operand("=");
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
    setWordOutput(toWords(arabicOutput).join(" "));
}
function change_style(value) {
    romanLookups.setLargeStyle(value);
    updateRomanDisplays();
    localStorage.setItem("large-style", value);
}
function updateRomanDisplays() {
    setRomanOutput(convert(arabicOutput));
    let romanExpression = [];
    for (let i = 0; i < arabicExpression.length; i++) {
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
    setWordOutput(toWords(arabicOutput).join(" "));

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
    for (let i = 0; i < arabicExpression.length; i++) {
        if (isNumber(arabicExpression[i])) {
            wordExpression.push(...toWords(arabicExpression[i]));
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
    if (isNaN(arabicExpression[0])) {
        return;
    }
    wordExpression.push(...toWords(arabicExpression[0]));
    wordExpression.push("multiplicati per");
    if (arabicExpression.length < 3) {
        return;
    }
    const secondNumber = toWords(arabicExpression[2]);
    toAccusative(secondNumber);
    wordExpression.push(...secondNumber);
    wordExpression.push("fiunt");
}

function toAccusative(nominative) {
    for (let i = 0; i < nominative.length; i++) {
        let w = nominative[i];
        if (wordLookups.integersAccusative[w]) {
            nominative[i] = wordLookups.integersAccusative[w];
        }
        if (wordLookups.fractionsAccusative[w]) {
            nominative[i] = wordLookups.fractionsAccusative[w];
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

function isNumber(string) {
    return !isNaN(string);
}
function convert(arabic) {
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

function toWords(arabic) {
    var words = [], i;
    if (arabic >= 2000) {
        let thousands = Math.floor(arabic / 1000);
        words.push(...toWords(thousands));
        toNeuter(words);
        words.push("millia");
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

function setWordOutput(value) {
    var expressionElement = document.getElementById("output_word");
    if (typeof value === "object") {
        expressionElement.innerHTML = value.join('');
    } else {
        expressionElement.innerHTML = value;
    }
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
    setWordOutput(toWords(arabicOutput));
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
    if (value === "=") {
        if (arabicExpression.length > 0 && arabicOutput !== "") {
            arabicExpression.push(arabicOutput);
            solve();
            newInput = true;
            hasOperand = false;
            arabicExpression.push(value);
        }
    } else if (hasOperand) { //start a new operation immediately after a previous one
        if (arabicOutput === "") {
            arabicExpression.pop();
            arabicExpression.push(value);
        } else {
            arabicExpression.push(arabicOutput);
            solve();
            var oldOutput = arabicOutput;
            clr();
            arabicExpression.push(oldOutput, value);
        }
    }
    else if (newInput) { //start a new operation from the output of a previous one
        var oldOutput = arabicOutput;
        clr();
        arabicExpression.push(oldOutput, value);
        hasOperand = true;
    } else {
        arabicExpression.push(arabicOutput);
        arabicExpression.push(value);
        hasOperand = true;
        arabicOutput = "";
    }
    updateRomanDisplays();
    updateArabicDisplays();
    updateWordDisplays();
    hasComma = false;
}
function solve() {
    let result = Function(`'use strict'; return (${convert_operands(arabicExpression.join(''))})`)();
    arabicOutput = round(result, decimal_places);
    setArabicOutput(arabicOutput);
    setRomanOutput(convert(result));
    setWordOutput(toWords(result).join(" "));
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