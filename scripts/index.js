import * as romanLookups from "./roman-lookups.js";
import * as converter from "./converter.js";

var arabicOutput = "";
var arabicExpression = [];
var arabicVisible = true;
var wordVisible = true;
var romanVisible = true;
var areFractionsDecimal = false;

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

if (localStorage.getItem("fractions-decimal")) {
    let storedFractions = localStorage.getItem("fractions-decimal");
    if (storedFractions == 1) {
        document.querySelector("#simple_frac").checked = false;
        document.querySelector("#decimal_frac").checked = true;
        areFractionsDecimal = true;
    }
}

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
    elem => elem.addEventListener('click', () => setRomanStyle(elem.id))
)

Array.from(document.getElementsByName("arabic_style")).forEach(
    elem => elem.addEventListener('click', () => setFractionStyle(elem.id))
)

document.querySelector("#show_arabic").addEventListener('click', show_arabic);
document.querySelector("#show_word").addEventListener('click', show_word);
document.querySelector("#show_roman").addEventListener('click', show_roman);
document.querySelector("#arabic_digits").addEventListener('change', updateArabicDisplays);

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
    if (arabicExpression.length > 2) {
        clr();
    }
    if (value == '.') {
        if (arabicOutput.includes('.')) {
            return;
        }
    }
    arabicOutput += value;
    setArabicOutput(arabicOutput);
    setRomanOutput(converter.toRoman(arabicOutput));
    setWordOutput(converter.toWords(arabicOutput).join(" "));
}

function setFractionStyle(value) {
    switch (value) {
        case "simple_frac":
            areFractionsDecimal = false;
            break;
        case "decimal_frac":
            areFractionsDecimal = true;
            break;
        default:
            break;
    }
    updateArabicDisplays();
}

function setRomanStyle(value) {
    romanLookups.setLargeStyle(value);
    updateRomanDisplays();
    localStorage.setItem("large-style", value);
}
function updateRomanDisplays() {
    if (converter.isFraction(arabicOutput)) {
        let numberValue = converter.toDecimal(arabicOutput);
        setRomanOutput(converter.toRoman(numberValue));
    } else {
        setRomanOutput(converter.toRoman(arabicOutput));
    }
    let romanExpression = [];
    for (let i = 0; i < arabicExpression.length; i++) {
        let numberValue = converter.toDecimal(arabicExpression[i]);
        if (!isNaN(numberValue)) {
            romanExpression.push(converter.toRoman(numberValue));
        } else {
            romanExpression.push(arabicExpression[i]);
        }
    }
    setRomanExpression(romanExpression);
}
function updateArabicDisplays() {
    var precision = document.querySelector("#arabic_digits").value;
    var processedOutput;
    if (arabicExpression.length > 2 && areFractionsDecimal) {
        processedOutput = converter.toDecimal(arabicOutput, precision);
    } else {
        processedOutput = arabicOutput;
    }
    setArabicOutput(processedOutput);
    var processedExpression;
    if (areFractionsDecimal) {
        processedExpression = [];
        for (let i = 0; i < arabicExpression.length; i++) {
            const e = arabicExpression[i];
            if (converter.isFraction(e)) {
                processedExpression.push(converter.toDecimal(e, precision));
            } else {
                processedExpression.push(e);
            }
        }
    } else {
        processedExpression = arabicExpression;
    }
    setArabicExpression(processedExpression);
}

function updateWordDisplays() {
    if (converter.isFraction(arabicOutput)) {
        let numberValue = converter.toDecimal(arabicOutput);
        setWordOutput(converter.toWords(numberValue).join(" "));
    } else {
        setWordOutput(converter.toWords(arabicOutput).join(" "));
    }

    let decimalExpression = [];

    for (let i = 0; i < arabicExpression.length; i++) {
        const element = arabicExpression[i];
        let decimal = converter.toDecimal(element);
        if (isNaN(decimal)) {
            decimalExpression.push(element);
        } else {
            decimalExpression.push(decimal);
        }
    }

    if (isNaN(decimalExpression[0])) {
        return;
    }

    let wordExpression = [];
    switch (arabicExpression[1]) {
        case "+":
            wordExpression = converter.additionToWords(decimalExpression);
            break;
        case minusSign:
            wordExpression = converter.subtractionToWords(decimalExpression);
            break;
        case multiplySign:
            wordExpression = converter.multiplicationToWords(decimalExpression);
            break;
        case divideSign:
            wordExpression = converter.divisionToWords(decimalExpression);
            break;
        default:
            break;
    }
    setWordExpression(wordExpression.join(" "));
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
    arabicExpression = [];
}
function backspace() {
    if (arabicExpression.length > 2) {
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
            arabicExpression.push(value);
        }
    } else if (arabicExpression[1]) { //start a new operation immediately after a previous one
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
    else if (arabicExpression.length > 2) { //start a new operation from the output of a previous one
        var oldOutput = converter.toFraction(arabicOutput);
        clr();
        arabicExpression.push(oldOutput, value);
    } else {
        arabicExpression.push(converter.toFraction(arabicOutput));
        arabicExpression.push(value);
        arabicOutput = "";
    }
    updateRomanDisplays();
    updateArabicDisplays();
    updateWordDisplays();
}

function solve() {
    var arg0 = Fraction(arabicExpression[0]), arg1 = Fraction(arabicExpression[2]);
    var result;
    switch (arabicExpression[1]) {
        case "+":
            result = arg0.add(arg1);
            break;
        case minusSign:
            result = arg0.sub(arg1);
            break;
        case multiplySign:
            result = arg0.mul(arg1);
            break;
        case divideSign:
            result = arg0.div(arg1);
            break;
        default:
            break;
    }
    arabicOutput = result.toFraction();
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