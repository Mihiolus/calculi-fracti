import*as romanLookups from"./roman-lookups-min.js";import*as converter from"./converter-min.js";var arabicOutput="",arabicExpression=[],arabicVisible=!0,wordVisible=!0,romanVisible=!0,areFractionsDecimal=!1;const minusSign="−",multiplySign="×",divideSign="÷",invalidString="invalid operation",maxInputLength=13;var settingsVisible=!0,legendVisible=!0;if(toggleSettings(),toggleLegend(),localStorage.getItem("large-style")){document.querySelector("#vincul_with_m").checked=!1;let e=localStorage.getItem("large-style");romanLookups.setLargeStyle(e),document.querySelector(`#${e}`).checked=!0}if(localStorage.getItem("show-roman")){let e=localStorage.getItem("show-roman");0==e&&show_roman(),document.querySelector("#show_roman").checked=1==e}if(localStorage.getItem("show-word")){let e=localStorage.getItem("show-word");0==e&&show_word(),document.querySelector("#show_word").checked=1==e}if(localStorage.getItem("show-arabic")){let e=localStorage.getItem("show-arabic");0==e&&show_arabic(),document.querySelector("#show_arabic").checked=1==e}if(localStorage.getItem("fractions-decimal")){1==localStorage.getItem("fractions-decimal")&&(document.querySelector("#simple_frac").checked=!1,document.querySelector("#decimal_frac").checked=!0,document.querySelector("#arabic_digits").disabled=!1,areFractionsDecimal=!0)}if(localStorage.getItem("decimal-places")){let e=localStorage.getItem("decimal-places");document.querySelector("#arabic_digits").value=e,document.querySelector("label[for='decimal_frac']").innerHTML=`Decimal: ${converter.toDecimal("1/3",e)}`}document.addEventListener("keydown",processKey),Array.from(document.querySelectorAll("table > input")).forEach((e=>e.addEventListener("keydown",preventEnter)));for(let e=0;e<10;e++)document.querySelector(`[id='${e}']`).addEventListener("click",(()=>store(e)));function processKey(e){if(e.key>="0"&&e.key<="9"||"."==e.key)store(e.key);else if("+"==e.key||"-"==e.key||"*"==e.key||"/"==e.key){addOperator(inverse_convert_operands(e.key))}else"Backspace"==e.key?backspace():"Escape"==e.key?clr():"Enter"==e.key&&addOperator("=")}function preventEnter(e){"Enter"==e.key&&e.preventDefault()}function store(e){if((arabicExpression.length>2||converter.isFraction(arabicOutput))&&clr(),!("."==e&&arabicOutput.includes(".")||arabicOutput.length>13)){if(arabicOutput+=e,converter.isFraction(arabicOutput)&&areFractionsDecimal){let e=document.querySelector("#arabic_digits").value;setArabicOutput(converter.toDecimal(arabicOutput,e))}else setArabicOutput(arabicOutput);setRomanOutput(converter.toRoman(arabicOutput)),setWordOutput(converter.toWords(arabicOutput).join(" ")),updateButtonStatus()}}function setFractionStyle(e){switch(e){case"simple_frac":areFractionsDecimal=!1,document.querySelector("#arabic_digits").disabled=!0;break;case"decimal_frac":areFractionsDecimal=!0,document.querySelector("#arabic_digits").disabled=!1;break;default:break}updateArabicDisplays(),localStorage.setItem("fractions-decimal",areFractionsDecimal?1:0)}function setRomanStyle(e){romanLookups.setLargeStyle(e),updateRomanDisplays(),localStorage.setItem("large-style",e)}function updateRomanDisplays(){if(converter.isFraction(arabicOutput)){let e=converter.toDecimal(arabicOutput);setRomanOutput(converter.toRoman(e))}else setRomanOutput(converter.toRoman(arabicOutput));let e=[];for(let t=0;t<arabicExpression.length;t++){let r=converter.toDecimal(arabicExpression[t]);isNaN(r)?e.push(arabicExpression[t]):e.push(converter.toRoman(r))}setRomanExpression(e)}function updateArabicDisplays(){var e,t=document.querySelector("#arabic_digits").value;if(setArabicOutput((converter.isFraction(arabicOutput)||arabicExpression.length>2)&&areFractionsDecimal?converter.toDecimal(arabicOutput,t):arabicOutput),areFractionsDecimal){e=[];for(let r=0;r<arabicExpression.length;r++){const a=arabicExpression[r];converter.isFraction(a)?e.push(converter.toDecimal(a,t)):e.push(a)}}else e=arabicExpression;setArabicExpression(e)}function changeDecimalPlaces(){updateArabicDisplays();var e=document.querySelector("#arabic_digits").value;document.querySelector("label[for='decimal_frac']").innerHTML=`Decimal: ${converter.toDecimal("1/3",e)}`,localStorage.setItem("decimal-places",e)}function updateWordDisplays(){if(converter.isFraction(arabicOutput)){let e=converter.toDecimal(arabicOutput);setWordOutput(converter.toWords(e).join(" "))}else setWordOutput(converter.toWords(arabicOutput).join(" "));let e=[];for(let t=0;t<arabicExpression.length;t++){const r=arabicExpression[t];let a=converter.toDecimal(r);isNaN(a)?e.push(r):e.push(a)}if(isNaN(e[0]))return;let t=[];switch(arabicExpression[1]){case"+":t=converter.additionToWords(e);break;case"−":t=converter.subtractionToWords(e);break;case"×":t=converter.multiplicationToWords(e);break;case"÷":t=converter.divisionToWords(e);break;default:break}setWordExpression(t.join(" "))}function setWordOutput(e){var t=document.getElementById("output_word");t.innerHTML="object"==typeof e?e.join(""):e}function clr(){setRomanOutput(""),setRomanExpression(""),arabicOutput="",setArabicOutput(""),setArabicExpression(""),setWordOutput(""),setWordExpression(""),arabicExpression=[],updateButtonStatus()}function backspace(){isButtonDisabled("bksp")||(setArabicOutput(arabicOutput=arabicOutput.slice(0,-1)),setRomanOutput(converter.toRoman(arabicOutput)),setWordOutput(converter.toWords(arabicOutput).join(" ")),updateButtonStatus())}function setRomanOutput(e){document.getElementById("output_roman").innerHTML=e}function setRomanExpression(e){let t=document.getElementById("expression_roman");t.innerHTML="object"==typeof e?addWordBreaks(e).join(""):e}function addWordBreaks(e){let t=[...e];switch(e[1]){case"+":case"−":case"×":case"÷":t[1]+="<wbr>";break}return t}function setArabicOutput(e){document.getElementById("output_arabic").innerHTML=prettifyFraction(e)}function prettifyFraction(e){if(e.indexOf("/")<0)return e;var t=new Fraction(e),r=Math.floor(t.n/t.d),a=t.n-r*t.d,o="";return t.s<0&&(o+="−"),r>0&&(o+=`${r}&hairsp;`),`${o}<span class="frac"><sup>${a}</sup><sub>${t.d}</sub></span>`}function setArabicExpression(e){let t=document.getElementById("expression_arabic");if("object"==typeof e){var r=[...e];for(let e=0;e<r.length;e++){const t=r[e];t.length<2||(r[e]=prettifyFraction(t))}t.innerHTML=addWordBreaks(r).join("")}else t.innerHTML=e}function setWordExpression(e){let t=document.getElementById("expression_word");t.innerHTML="object"==typeof e?e.join(""):e}function updateButtonStatus(){const e=[];e.push(document.querySelector("[id='+']"),document.querySelector("[id='−']"),document.querySelector("[id='×']"),document.querySelector("[id='÷']"),document.querySelector("[id='=']"),document.querySelector("#bksp"),document.querySelector("[id='.']"));for(let t=0;t<10;t++){const r=document.querySelector(`[id='${t}']`);e.push(r)}e.push(document.querySelector("#mc"),document.querySelector("#ms"),document.querySelector("#mr"));for(const t of e)t.disabled=isButtonDisabled(t.id)}function isButtonDisabled(e){switch(e){case"bksp":return arabicExpression.length>2||""===arabicOutput||converter.isFraction(arabicOutput);case"÷":case"×":case"−":case"+":return arabicOutput===invalidString||0==arabicExpression.length&&""===arabicOutput;case"ms":return 0===arabicOutput.length;case"mr":case"mc":return!localStorage.getItem("memory");case"=":return arabicOutput===invalidString||""===arabicOutput||arabicExpression.length<2||arabicExpression.length>3&&""!==arabicOutput;case".":return arabicExpression.length<=2&&arabicOutput.length>13||arabicOutput.includes(".");case"9":case"8":case"7":case"6":case"5":case"4":case"3":case"2":case"1":case"0":return arabicExpression.length<=2&&arabicOutput.length>13;default:return!1}}function addOperator(e){if(arabicOutput!==invalidString&&(0!=arabicExpression.length||""!==arabicOutput)){if("="===e){if(""===arabicOutput||arabicExpression.length<2||arabicExpression.length>3&&""!==arabicOutput)return;arabicExpression.push(converter.toFraction(arabicOutput)),solve(),arabicExpression.push(e)}else if(arabicExpression[1])if(""===arabicOutput)arabicExpression.pop(),arabicExpression.push(e);else if(arabicExpression.push(converter.toFraction(arabicOutput)),solve(),arabicOutput===invalidString)arabicExpression.push("=");else{var t=converter.toFraction(arabicOutput);clr(),arabicExpression.push(t,e)}else if(arabicExpression.length>2){t=converter.toFraction(arabicOutput);clr(),arabicExpression.push(t,e)}else arabicExpression.push(converter.toFraction(arabicOutput)),arabicExpression.push(e),arabicOutput="";updateRomanDisplays(),updateArabicDisplays(),updateWordDisplays(),updateButtonStatus()}}function solve(){var e,t=Fraction(arabicExpression[0]),r=Fraction(arabicExpression[2]);try{switch(arabicExpression[1]){case"+":e=t.add(r);break;case"−":e=t.sub(r);break;case"×":e=t.mul(r);break;case"÷":e=t.div(r);break;default:break}}catch(e){return void(arabicOutput=invalidString)}e=e.valueOf(),arabicOutput=converter.isDecimal(e)?converter.toFraction(e):e.toString()}function inverse_convert_operands(e){return e=(e=(e=e.replace("-","−")).replace("*","×")).replace("/","÷")}function show_arabic(){arabicVisible=!arabicVisible;let e=document.getElementsByClassName("arabic_display");for(let t=0;t<e.length;t++)e[t].style.display=arabicVisible?"":"none";localStorage.setItem("show-arabic",arabicVisible?1:0)}function show_word(){wordVisible=!wordVisible;let e=document.getElementsByClassName("word_display");for(let t=0;t<e.length;t++)e[t].style.display=wordVisible?"":"none";document.querySelector("#show_roman").disabled=!wordVisible,localStorage.setItem("show-word",wordVisible?1:0)}function show_roman(){romanVisible=!romanVisible;let e=document.getElementsByClassName("roman_display");for(let t=0;t<e.length;t++)e[t].style.display=romanVisible?"":"none";document.querySelector("#show_word").disabled=!romanVisible,localStorage.setItem("show-roman",romanVisible?1:0)}function toggleSettings(){settingsVisible=!settingsVisible;var e=document.querySelector("#settings>.slider").offsetWidth;document.querySelector("#settings").style.transform=settingsVisible?"translate(1000px, 0px)":`translate(${1e3-e}px, 0px)`}function toggleLegend(){legendVisible=!legendVisible;var e=document.querySelector("#legend>.slider").offsetWidth;document.querySelector("#legend").style.transform=legendVisible?"translate(-1000px, 0px)":`translate(${e-1e3}px, 0px)`}function clearMemory(){localStorage.removeItem("memory"),updateButtonStatus()}function saveToMemory(){localStorage.setItem("memory",converter.toFraction(arabicOutput)),updateButtonStatus()}function recallMemory(){arabicOutput="",store(localStorage.getItem("memory"))}document.querySelector("#clr").addEventListener("click",(()=>clr())),document.querySelector("#bksp").addEventListener("click",(()=>backspace())),document.querySelector("[id='÷']").addEventListener("click",(()=>addOperator("÷"))),document.querySelector("[id='×']").addEventListener("click",(()=>addOperator("×"))),document.querySelector("[id='−']").addEventListener("click",(()=>addOperator("−"))),document.querySelector("[id='+']").addEventListener("click",(()=>addOperator("+"))),document.querySelector("[id='.']").addEventListener("click",(()=>store("."))),document.querySelector("[id='=']").addEventListener("click",(()=>addOperator("="))),Array.from(document.querySelectorAll("input[name='large_style']")).forEach((e=>e.addEventListener("click",(()=>setRomanStyle(e.id))))),Array.from(document.getElementsByName("arabic_style")).forEach((e=>e.addEventListener("click",(()=>setFractionStyle(e.id))))),document.querySelector("#show_arabic").addEventListener("click",show_arabic),document.querySelector("#show_word").addEventListener("click",show_word),document.querySelector("#show_roman").addEventListener("click",show_roman),document.querySelector("#arabic_digits").addEventListener("change",changeDecimalPlaces),updateButtonStatus(),document.querySelector("#settings>.trigger").addEventListener("click",toggleSettings),document.querySelector("#legend>.trigger").addEventListener("click",toggleLegend),document.querySelector("#mc").addEventListener("click",clearMemory),document.querySelector("#mr").addEventListener("click",recallMemory),document.querySelector("#ms").addEventListener("click",saveToMemory);