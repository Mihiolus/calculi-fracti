import*as wordLookups from"./word-lookups-min.js";import*as romanLookups from"./roman-lookups-min.js";const maxRomanNumeral=5e5,undefined="(<abbr title = 'Non Numerabile'>NN</abbr>)",maxWordNumber=9999999,tolerance=1e-6;export function toRoman(o){if(""===o)return o;if(isFraction(o)&&(o=toDecimal(o)),o<=0||o>5e5)return undefined;var e="",t=Number(o);for(let o in romanLookups.current)for(;t+1e-6>=romanLookups.current[o];){e+=o;let r=t;t-=romanLookups.current[o],!isMagnitudeSame(r,t)&&(1!==getMagnitude(r)||0!==getMagnitude(t))&&getMagnitude(t)>=-1?e+=romanLookups.magnitudeSeparator:t>10&&(e+=romanLookups.numeralSeparator)}return""===e?undefined:e}export function isDecimal(o){return!isNaN(o)&&o%1!=0}export function isFraction(o){return"string"==typeof o&&(!isDecimal(o)&&!(o.indexOf("/")<0))}export function toFraction(o){if(!isDecimal(o))return o;var e=Number(o),t=Math.sign(e),r=Math.floor(288*Math.abs(e));return new Fraction(t*r,288).toFraction()}export function toDecimal(o,e=15){if(!isNaN(o))return o;if(o.indexOf("/")<0)return NaN;let t=o.split("/");return String(bankersRound(t[0]/t[1],e))}function bankersRound(o,e){o*=Math.pow(10,e);const t=Math.floor(o);var r=o-t;return(o=r>.5+Number.EPSILON||r<.5-Number.EPSILON?Math.round(o):t%2==0?t:t+1)/Math.pow(10,e)}function isMagnitudeSame(o,e){return getMagnitude(o)===getMagnitude(e)}function getMagnitude(o){return Math.floor(Math.log10(o))}export function toWords(o){if(""===o)return[o];if(isFraction(o)&&(o=toDecimal(o)),o<=0||o>9999999)return[undefined];var e=[],t=[];if((o=Number(o))>=1e6){let t=Math.floor(o/1e5);e.push(...toAdverbial(t)),e.push("centum","milia"),(o-=1e5*t)>0&&e.push("et")}if(o>=1e5){let e=100*Math.floor(o/1e5);t.push(...toWords(e)),toNeuter(t),(o-=1e3*e)<2e3&&t.push("milia")}if(o>=2e3){let e=Math.floor(o/1e3);e>=21&&e%10==1&&(t.length>0&&t.push("et"),t.push("unum","et"),e-=1,o-=1e3),t.push(...toWords(e)),toNeuter(t),t.push("milia"),o-=1e3*e}o/1e3>=1&&(e.push("mille"),o-=1e3,t.length>0&&e.push("et")),e.push(...t);for(let t in wordLookups.integersNominative)if(o>=wordLookups.integersNominative[t])e.push(t),o-=wordLookups.integersNominative[t];else if(o>=18&&o<98)for(let r in wordLookups.prefixes)o>=wordLookups.integersNominative[t]+wordLookups.prefixes[r]&&(e.push(r+t),o-=wordLookups.integersNominative[t]+wordLookups.prefixes[r]);var r=[];for(let e in wordLookups.fractionsNominative)o+1e-6>=wordLookups.fractionsNominative[e]&&(r.push(e),o-=wordLookups.fractionsNominative[e]);if(r.length>0){e.length>0&&e.push("et");for(let o=0;o<r.length&&(e.push(r[o]),o!==r.length-1);o++)e.push("et")}return 0===e.length?[undefined]:e}function toAccusative(o){convertCase(o,wordLookups.integersAccusative,wordLookups.fractionsAccusative)}function toAblative(o){convertCase(o,wordLookups.integersAblative,wordLookups.fractionsAblative)}function convertCase(o,e,t){for(let r=0;r<o.length;r++){let n=o[r];e[n]&&(o[r]=e[n]),t[n]&&(o[r]=t[n])}}function toNeuter(o){for(let e=0;e<o.length;e++){let t=o[e];wordLookups.integersNeuter[t]&&(o[e]=wordLookups.integersNeuter[t])}}function toAdverbial(o){var e=[];for(let t in wordLookups.adverbial)if(o>=wordLookups.adverbial[t])1===wordLookups.adverbial[t]?e.splice(e.length-2,0,t,"et"):wordLookups.adverbial[t]<10?e.splice(e.length-2,0,t):e.push(t),o-=wordLookups.adverbial[t];else if(o>=18&&o<98)for(let r in wordLookups.prefixes)o>=wordLookups.adverbial[t]+wordLookups.prefixes[r]&&(e.push(r+t),o-=wordLookups.adverbial[t]+wordLookups.prefixes[r]);return e}export function additionToWords(o){var e=[];for(let t=0;t<o.length;t++)isNaN(o[t])?"+"===o[t]?e.push("et"):e.push("sunt"):e.push(...toWords(o[t]));return e}function isEndingPlural(o){var e=!0;for(let t in wordLookups.genders)if(t===o[o.length-1]){wordLookups.genders[t].includes("pl")||(e=!1);break}return e}function pushInflected(o,e,t){var r="mpl";for(let o in wordLookups.genders)o===e[e.length-1]&&(r=wordLookups.genders[o]);o.push(t+wordLookups.participleEndings[r])}export function subtractionToWords(o){var e=[];e.push("de");let t=toWords(o[0]);if(toAblative(t),e.push(...t),o.length<3)return e.push("deducti"),e;let r=toWords(o[2]),n=[];return n.push(...r),pushInflected(n,r,"deduct"),n.push(...e),isEndingPlural(r)?n.push("fiunt"):n.push("fit"),n}export function multiplicationToWords(o){var e=[];e.push(...toWords(o[0]));var t=isEndingPlural(e);if(pushInflected(e,e,"multiplicat"),e.push("per"),o.length<3)return e;const r=toWords(o[2]);return toAccusative(r),e.push(...r),t?e.push("fiunt"):e.push("fit"),e}export function divisionToWords(o){var e=[];e.push(...toWords(o[0]));var t=isEndingPlural(e);if(pushInflected(e,e,"divis"),e.push("in"),o.length<3)return e;let r=toWords(o[2]);return toAccusative(r),e.push(...r),t?e.push("fiunt"):e.push("fit"),e}