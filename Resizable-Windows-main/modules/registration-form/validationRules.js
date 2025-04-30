export const validationRules = {
    "en-us": {
        placeholder: "(###) ###-####",
        format: "(###) ###-####",
        countryCode: '+1',
        testPattern: /^(?:\+1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}$/g
    },
    "en-uk": {
        placeholder: "+44 #### ######",
        format: "+44 #### ######",
        countryCode: '+44',
        testPattern: /^(?:\+44\s?7\d{3}|\07\d{3})\s?\d{3}\s?\d{3}$/
    },
    "en-au": {
        placeholder: "+61 4xx xxx xxx",
        format: "+61 4xx xxx xxx",
        countryCode: '+61',
        testPattern: /^(?:\+61\s?4\d{2}|04\d{2})\s?\d{3}\s?\d{3}$/
    },
    "de-de": {
        placeholder: "+49 (###) ###-####",
        format: "+49 (###) ###-####",
        countryCode: '+49',
        testPattern: /^\+49[\-\s]?((?:\d[\-\s]?){10})$/g
    },
    "fr-fr": {
        placeholder: "+33 (0) # ## ## ## ##",
        format: "+33 (0) # ## ## ## ##",
        countryCode: '+33',
        testPattern: /^(?:\+33\s?|0)[1-9](?:[\s.-]?\d{2}){4}$/
    },
    "en-ie": {
        placeholder: "+353 8x xxx xxxx",
        format: "+353 8x xxx xxxx",
        countryCode: '+353',
        testPattern: /^(?:\+353\s?8[35679]\s?\d{3}\s?\d{4}|08[35679]\s?\d{3}\s?\d{4})$/
    },
};



/* 
United States (en-us)
Valid: +1 555-555-5555
Invalid: +1 555-555-555 (too few digits)
United Kingdom (en-uk)
Valid: +44 7700 900123
Invalid: +44 77009 00123 (incorrect format)
Australia (en-au)
Valid:  +61 412 345 678
Invalid: 04123 456 78 (incorrect format)
Germany (de-de)
Valid: +49 30 12345678
Invalid: +49 30 123 456 (too few digits)
France (fr-fr)
Valid: +33 1 23 45 67 89
Invalid: +33 12 34 56 78 (incorrect format)
Ireland (en-ie)
Valid: +353 83 123 4567
Invalid: +353 083 123 456 (incorrect format)
*/