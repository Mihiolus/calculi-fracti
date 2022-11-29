export const LargeStyle = {
    apost: 'apostr',
    apostrTight: 'apost_tight',
    vincul: 'vincul',
    vinculWithM: 'vincul_with_m'
}

var largeLookups = {
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
var baseLookup = {
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
    '<abbr title="6&frasl;12">S</abbr>': 0.5,
    '<abbr title="5&frasl;12">⁙</abbr>': 5 / 12,
    '<abbr title="4&frasl;12">∷</abbr>': 1 / 3,
    '<abbr title="3&frasl;12">∴</abbr>': 1 / 4,
    '<abbr title="2&frasl;12">:</abbr>': 1 / 6,
    '<abbr title="1&frasl;12">·</abbr>': 1 / 12,
    '<abbr title="1&frasl;24">Є</abbr>': 1 / 24,
    '<abbr title="1&frasl;36">\u{10193}\u{10193}</abbr>': 1 / 36,
    '<abbr title="1&frasl;48">Ͻ</abbr>': 1 / 48,
    '<abbr title="1&frasl;72">\u{10193}</abbr>': 1 / 72,
    '<abbr title="1&frasl;144">\u{10194}</abbr>': 1 / 144,
    '<abbr title="1&frasl;288">Э</abbr>': 1 / 288
}
export var current = { ...largeLookups.vincul_with_m, ...baseLookup }

export var numeralSeparator = '<wbr>', magnitudeSeparator = '\u2006';
var apostrNumeralSeparator = '\u2005', regularNumeralSeparator = '<wbr>';
var apostrMagnitudeSeparator = '\u2002', regularMagnitudeSeparator = '\u2006';

export function setLargeStyle(style) {
    current = { ...largeLookups[style], ...baseLookup };
    if (style === 'apostr') {
        numeralSeparator = apostrNumeralSeparator;
        magnitudeSeparator = apostrMagnitudeSeparator;
    } else {
        numeralSeparator = regularNumeralSeparator;
        magnitudeSeparator = regularMagnitudeSeparator;
    }
}