import * as romanLookups from "./roman-lookups.js";
import * as converter from "./converter.js";

var arabicOutput = "";
var arabicExpression = [];
var newInput = false;
var hasComma = false;
var arabicVisible = true;
var wordVisible = true;
var hasOperand = false;
var romanVisible = true;

const minusSign = "−";
const multiplySign = "×";
const divideSign = "÷";

if (localStorage.getItem("large-style")) {
    document.querySelector("#vincul_with_m").checked = false;
    let storedStyle = localStorage.getItem("large-style");
    romanLookups.setLargeStyle(storedStyle);
    document.querySelector(`#${storedStyle}`).checked = true;
}

if (localStorage.getItem("show-roman")) {
    let storedRoman = localStorage.getItem("show-roman");
    if (storedRoman == 0) {
        show_roman();
    }
    document.querySelector("#show_roman").checked = storedRoman == 1;
}

if (localStorage.getItem("show-word")) {
    let storedWord = localStorage.getItem("show-word");
    if (storedWord == 0) {
        show_word();
    }
    document.querySelector("#show_word").checked = storedWord == 1;
}

if (localStorage.getItem("show-arabic")) {
    let storedArabic = localStorage.getItem("show-arabic");
    if (storedArabic == 0) {
        show_arabic();
    }
    document.querySelector("#show_arabic").checked = storedArabic == 1;
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
document.querySelector("#show_roman").addEventListener('click', show_roman);

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
    setRomanOutput(converter.toRoman(arabicOutput));
    setWordOutput(converter.toWords(arabicOutput).join(" "));
}

function change_style(value) {
    romanLookups.setLargeStyle(value);
    updateRomanDisplays();
    localStorage.setItem("large-style", value);
}
function updateRomanDisplays() {
    setRomanOutput(converter.toRoman(arabicOutput));
    let romanExpression = [];
    for (let i = 0; i < arabicExpression.length; i++) {
        if (!isNaN(arabicExpression[i])) {
            romanExpression.push(converter.toRoman(arabicExpression[i]));
        } else {
            romanExpression.push(arabicExpression[i]);
        }
    }
    setRomanExpression(romanExpression);
}
function updateArabicDisplays() {
    setArabicOutput(converter.toFraction(arabicOutput));
    setArabicExpression(arabicExpression);
}

function updateWordDisplays() {
    setWordOutput(converter.toWords(arabicOutput).join(" "));

    if (isNaN(arabicExpression[0])) {
        return;
    }

    let wordExpression = [];
    switch (arabicExpression[1]) {
        case "+":
            parseAddition(wordExpression);
            break;
        case minusSign:
            parseSubtraction(wordExpression);
            break;
        case multiplySign:
            parseMultiplication(wordExpression);
            break;
        case divideSign:
            parseDivision(wordExpression);
            break;
        default:
            break;
    }
    setWordExpression(wordExpression.join(" "));
}

function parseAddition(wordExpression) {
    for (let i = 0; i < arabicExpression.length; i++) {
        if (!isNaN(arabicExpression[i])) {
            wordExpression.push(...converter.toWords(arabicExpression[i]));
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
    wordExpression.push(...converter.toWords(arabicExpression[0]));

    let { isSingularMasc, isSingularNeut } = getEndingDeclension(wordExpression);

    pushInflected(wordExpression, wordExpression, "multiplicatus", "multiplicatum", "multiplicata", "multiplicati");
    wordExpression.push("per");

    if (arabicExpression.length < 3) {
        return;
    }
    const secondNumber = converter.toWords(arabicExpression[2]);
    converter.toAccusative(secondNumber);
    wordExpression.push(...secondNumber);
    if (isSingularMasc || isSingularNeut) {
        wordExpression.push("fit");
    } else {
        wordExpression.push("fiunt");
    }
}

function getEndingDeclension(wordArray) {
    let isSingularMasc = false, isSingularNeut = false, isPluralNeut = false;
    if (wordArray[wordArray.length - 1] === "unus") {
        isSingularMasc = true;
    }
    else if (wordArray[wordArray.length - 1] === "mille") {
        isSingularNeut = true;
    } else if (wordArray[wordArray.length - 1] === "milia") {
        isPluralNeut = true;
    }
    return { isSingularMasc, isSingularNeut, isPluralNeut };
}

function pushInflected(expression, inflectionSource, singMasc, singNeut, plurNeut, plurMasc) {
    let { isSingularMasc, isSingularNeut, isPluralNeut } = getEndingDeclension(inflectionSource);

    if (isPluralNeut) {
        expression.push(plurNeut);
    } else if (isSingularMasc) {
        expression.push(singMasc);
    } else if (isSingularNeut) {
        expression.push(singNeut);
    } else {
        expression.push(plurMasc);
    }
}

function parseSubtraction(wordExpression) {
    wordExpression.push("de");
    let first = converter.toWords(arabicExpression[0]);
    converter.toAblative(first);
    wordExpression.push(...first);
    if (arabicExpression.length < 3) {
        wordExpression.push("deducti");
        return;
    }
    let second = converter.toWords(arabicExpression[2]);

    let { isSingularMasc, isSingularNeut } = getEndingDeclension(second);

    pushInflected(wordExpression, second, "deductus", "deductum", "deducta", "deducti");
    wordExpression.push(...second);

    if (isSingularMasc || isSingularNeut) {
        wordExpression.push("fit");
    } else {
        wordExpression.push("fiunt");
    }
}

function parseDivision(wordExpression) {
    wordExpression.push(...converter.toWords(arabicExpression[0]));

    let { isSingularMasc, isSingularNeut } = getEndingDeclension(wordExpression);

    pushInflected(wordExpression, wordExpression, "divisus", "divisum", "divisa", "divisi");
    wordExpression.push("in");

    if (arabicExpression.length < 3) {
        return;
    }

    let second = converter.toWords(arabicExpression[2]);
    converter.toAccusative(second);
    wordExpression.push(...second);

    if (isSingularMasc || isSingularNeut) {
        wordExpression.push("fit");
    } else {
        wordExpression.push("fiunt");
    }
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
    if (newInput) {
        return;
    }
    arabicOutput = arabicOutput.slice(0, -1);
    setArabicOutput(arabicOutput);
    setRomanOutput(converter.toRoman(arabicOutput));
    setWordOutput(converter.toWords(arabicOutput).join(" "));
}
function setRomanOutput(value) {
    document.getElementById("output_roman").innerHTML = value;
}
function setRomanExpression(value) {
    let expressionElement = document.getElementById("expression_roman");
    if (typeof value === "object") {
        expressionElement.innerHTML = addWordBreaks(value).join('');
    } else {
        expressionElement.innerHTML = value;
    }
}

function addWordBreaks(expression) {
    let newExpression = [...expression];
    switch (expression[1]) {
        case "+":
        case minusSign:
        case multiplySign:
        case divideSign:
            newExpression[1] += "<wbr>";
            break;
    }
    return newExpression;
}

function setArabicOutput(value) {
    const field = document.getElementById("output_arabic");
    field.innerHTML = prettifyFraction(value);
}

function prettifyFraction(string) {
    var slashPos = string.indexOf('/');
    if (slashPos < 0) {
        return string;
    }
    var numerator, denominator;
    [numerator, denominator] = string.split('/');
    var whole = Math.floor(numerator / denominator);
    numerator -= whole * denominator;
    var result = "";
    if (whole > 0) {
        result += `${whole}&hairsp;`;
    }
    return `${result}<span class="frac"><sup>${numerator}</sup><sub>${denominator}</sub></span>`;
}

function setArabicExpression(value) {
    let expressionElement = document.getElementById("expression_arabic");
    if (typeof value === "object") {
        var prettyExpr = [...value];
        for (let i = 0; i < prettyExpr.length; i++) {
            const element = prettyExpr[i];
            if (element.length < 2) continue;
            prettyExpr[i] = prettifyFraction(element);
        }
        expressionElement.innerHTML = addWordBreaks(prettyExpr).join('');
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
    if (arabicExpression.length == 0 && arabicOutput === "") {
        return;
    }
    if (value === "=") {
        if (arabicExpression.length > 0 && arabicOutput !== "") {
            arabicExpression.push(converter.toFraction(arabicOutput));
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
            arabicExpression.push(converter.toFraction(arabicOutput));
            solve();
            var oldOutput = converter.toFraction(arabicOutput);
            clr();
            arabicExpression.push(oldOutput, value);
        }
    }
    else if (newInput) { //start a new operation from the output of a previous one
        var oldOutput = converter.toFraction(arabicOutput);
        clr();
        arabicExpression.push(oldOutput, value);
        hasOperand = true;
        newInput = false;
    } else {
        arabicExpression.push(converter.toFraction(arabicOutput));
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
    arabicOutput = String(result);
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
    localStorage.setItem("show-arabic", arabicVisible ? 1 : 0);
}
function show_word() {
    wordVisible = !wordVisible;
    let elements = document.getElementsByClassName("word_display");
    for (let i = 0; i < elements.length; i++) {
        elements[i].style.display = wordVisible ? "" : "none";
    }
    document.querySelector("#show_roman").disabled = !wordVisible;
    localStorage.setItem("show-word", wordVisible ? 1 : 0);
}

function show_roman() {
    romanVisible = !romanVisible;
    let elements = document.getElementsByClassName("roman_display");
    for (let i = 0; i < elements.length; i++) {
        elements[i].style.display = romanVisible ? "" : "none";
    }
    document.querySelector("#show_word").disabled = !romanVisible;
    localStorage.setItem("show-roman", romanVisible ? 1 : 0);
}