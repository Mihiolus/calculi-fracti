export const LargeStyle = {
    apost: 'apostr',
    apostrTight: 'apost_tight',
    vincul: 'vincul',
    vinculWithM: 'vincul_with_m'
}

var largeLookups = {
    apostr: {
        "CCCIↃↃↃ<wbr>": 100000,
        "IↃↃↃ<wbr>": 50000,
        "CCIↃↃ<wbr>": 10000,
        "IↃↃ<wbr>": 5000,
        "CIↃ<wbr>": 1000,
        "CCIↃ<wbr>": 900
    },
    apostr_tight: {
        "ↈ<wbr>": 100000,
        "ↇ<wbr>": 50000,
        "ↂ<wbr>": 10000,
        "ↁ<wbr>": 5000,
        "ↀ<wbr>": 1000,
        "Cↀ<wbr>": 900
    },
    vincul: {
        '<span style="border-top:1px solid;">C</span><wbr>': 100000,
        '<span style="border-top:1px solid;">L</span><wbr>': 50000,
        '<span style="border-top:1px solid;">X</span><wbr>': 10000,
        '<span style="border-top:1px solid;">V</span><wbr>': 5000,
        '<span style="border-top:1px solid;">I</span><wbr>': 1000,
        'C<span style="border-top:1px solid;">I</span><wbr>': 900
    },
    vincul_with_m: {
        '<span style="border-top:1px solid;">C</span><wbr>': 100000,
        '<span style="border-top:1px solid;">L</span><wbr>': 50000,
        '<span style="border-top:1px solid;">X</span><wbr>': 10000,
        '<span style="border-top:1px solid;">V</span><wbr>': 5000,
        'M<wbr>': 1000,
        'CM<wbr>': 900
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
export var current = { ...largeLookups.vincul_with_m, ...baseLookup }

export function setLargeStyle(style) {
    current = { ...largeLookups[style], ...baseLookup };
}