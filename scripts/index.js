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

const invalidString = "invalid operation";
const maxInputLength = 13;

var settingsVisible = true, legendVisible = true;

toggleSettings();
toggleLegend();

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
        document.querySelector("#arabic_digits").disabled = false;
        areFractionsDecimal = true;
    }
}

if (localStorage.getItem("decimal-places")) {
    let storedDigits = localStorage.getItem("decimal-places");
    document.querySelector("#arabic_digits").value = storedDigits;
    document.querySelector("label[for='decimal_frac']").innerHTML = `Decimal: ${converter.toDecimal('1/3', storedDigits)}`;
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
document.querySelector("#arabic_digits").addEventListener('change', changeDecimalPlaces);

updateButtonStatus();

document.querySelector("#settings>.trigger").addEventListener('click', toggleSettings);
document.querySelector("#legend>.trigger").addEventListener('click', toggleLegend);

document.querySelector("#mc").addEventListener('click', clearMemory);
document.querySelector("#mr").addEventListener('click', recallMemory);
document.querySelector("#ms").addEventListener('click', saveToMemory);

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
    if (arabicExpression.length > 2 || converter.isFraction(arabicOutput)) {
        clr();
    }
    if (value == '.') {
        if (arabicOutput.includes('.')) {
            return;
        }
    }
    if (arabicOutput.length > maxInputLength) {
        return;
    }
    arabicOutput += value;
    setArabicOutput(arabicOutput);
    setRomanOutput(converter.toRoman(arabicOutput));
    setWordOutput(converter.toWords(arabicOutput).join(" "));
    updateButtonStatus();
}

function setFractionStyle(value) {
    switch (value) {
        case "simple_frac":
            areFractionsDecimal = false;
            document.querySelector("#arabic_digits").disabled = true;
            break;
        case "decimal_frac":
            areFractionsDecimal = true;
            document.querySelector("#arabic_digits").disabled = false;
            break;
        default:
            break;
    }
    updateArabicDisplays();
    localStorage.setItem("fractions-decimal", areFractionsDecimal ? 1 : 0);
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

function changeDecimalPlaces() {
    updateArabicDisplays();
    var d = document.querySelector("#arabic_digits").value;
    document.querySelector("label[for='decimal_frac']").innerHTML = `Decimal: ${converter.toDecimal('1/3', d)}`;
    localStorage.setItem("decimal-places", d);
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
    updateButtonStatus();
}
function backspace() {
    if (isButtonDisabled('bksp')) {
        return;
    }
    arabicOutput = arabicOutput.slice(0, -1);
    setArabicOutput(arabicOutput);
    setRomanOutput(converter.toRoman(arabicOutput));
    setWordOutput(converter.toWords(arabicOutput).join(" "));
    updateButtonStatus();
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
    var fraction = new Fraction(string);
    var whole = Math.floor(fraction.n / fraction.d);
    var numerator = fraction.n - whole * fraction.d;
    var result = "";
    if (fraction.s < 0) {
        result += minusSign;
    }
    if (whole > 0) {
        result += `${whole}&hairsp;`;
    }
    return `${result}<span class="frac"><sup>${numerator}</sup><sub>${fraction.d}</sub></span>`;
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
function updateButtonStatus() {
    const buttons = [];
    buttons.push(document.querySelector("[id='+']"),
        document.querySelector(`[id='${minusSign}']`),
        document.querySelector(`[id='${multiplySign}']`),
        document.querySelector(`[id='${divideSign}']`),
        document.querySelector("[id='=']"),
        document.querySelector("#bksp"),
        document.querySelector("[id='.']"));
    for (let num = 0; num < 10; num++) {
        const button = document.querySelector(`[id='${num}']`);
        buttons.push(button);
    }
    buttons.push(document.querySelector("#mc"),
        document.querySelector("#ms"),
        document.querySelector("#mr"));

    for (const button of buttons) {
        button.disabled = isButtonDisabled(button.id);
    }
}

function isButtonDisabled(id) {
    switch (id) {
        case 'bksp':
            return arabicExpression.length > 2 || arabicOutput === "" ||
                converter.isFraction(arabicOutput)
        case divideSign:
        case multiplySign:
        case minusSign:
        case '+':
            return arabicOutput === invalidString ||
                arabicExpression.length == 0 && arabicOutput === "";
        case 'ms':
            return arabicOutput.length === 0;
        case 'mr':
        case 'mc':
            return !localStorage.getItem("memory");
        case '=':
            return arabicOutput === invalidString || arabicOutput === "" ||
                arabicExpression.length < 2 || arabicExpression.length > 3 && arabicOutput !== "";
        case '.':
            return arabicExpression.length <= 2 && arabicOutput.length > maxInputLength
                || arabicOutput.includes('.');
        case '9':
        case '8':
        case '7':
        case '6':
        case '5':
        case '4':
        case '3':
        case '2':
        case '1':
        case '0':
            return arabicExpression.length <= 2 && arabicOutput.length > maxInputLength;
        default:
            return false;
    }
}

function add_operand(value) {
    if (arabicOutput === invalidString) {
        return;
    }
    if (arabicExpression.length == 0 && arabicOutput === "") {
        return;
    }
    if (value === "=") {
        if (arabicOutput === "" || arabicExpression.length < 2
            || arabicExpression.length > 3 && arabicOutput !== "") {
            return;
        }
        arabicExpression.push(converter.toFraction(arabicOutput));
        solve();
        arabicExpression.push(value);
    } else if (arabicExpression[1]) { //start a new operation immediately after a previous one
        if (arabicOutput === "") {
            arabicExpression.pop();
            arabicExpression.push(value);
        } else {
            arabicExpression.push(converter.toFraction(arabicOutput));
            solve();
            if (arabicOutput === invalidString) {
                arabicExpression.push("=");
            } else {
                var oldOutput = converter.toFraction(arabicOutput);
                clr();
                arabicExpression.push(oldOutput, value);
            }
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
    updateButtonStatus();
}

function solve() {
    var arg0 = Fraction(arabicExpression[0]), arg1 = Fraction(arabicExpression[2]);
    var result;
    try {
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
    } catch (e) {
        arabicOutput = invalidString;
        return;
    }
    result = result.valueOf();
    if (converter.isDecimal(result)) {
        arabicOutput = converter.toFraction(result);
    } else {
        arabicOutput = result.toString();
    }
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

function toggleSettings() {
    settingsVisible = !settingsVisible;
    var sliderWidth = document.querySelector("#settings>.slider").offsetWidth;
    document.querySelector("#settings").style.left = settingsVisible ? "0px" : `-${sliderWidth}px`;
}

function toggleLegend() {
    legendVisible = !legendVisible;
    var sliderWidth = document.querySelector("#legend>.slider").offsetWidth;
    document.querySelector("#legend").style.right = legendVisible ? "0px" : `-${sliderWidth}px`;;
}

function clearMemory() {
    localStorage.removeItem("memory");
    updateButtonStatus();
}

function saveToMemory() {
    localStorage.setItem("memory", converter.toFraction(arabicOutput));
    updateButtonStatus();
}

function recallMemory() {
    arabicOutput = "";
    store(localStorage.getItem("memory"));
    updateArabicDisplays();
    updateRomanDisplays();
    updateWordDisplays();
}