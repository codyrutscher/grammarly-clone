import type { GrammarSuggestion } from '../store/useDocumentStore';

// Common grammar patterns and rules
const grammarRules = [
  // Common grammar mistakes
  {
    pattern: /\bi\s+am\s+go/gi,
    suggestion: 'I am going',
    message: 'Use "going" instead of "go" with present continuous tense',
    type: 'grammar' as const,
    severity: 'high' as const
  },
  {
    pattern: /\btheir\s+are\b/gi,
    suggestion: 'there are',
    message: 'Use "there are" instead of "their are"',
    type: 'grammar' as const,
    severity: 'high' as const
  },
  {
    pattern: /\byour\s+welcome\b/gi,
    suggestion: "you're welcome",
    message: 'Use "you\'re welcome" (contraction) instead of "your welcome"',
    type: 'grammar' as const,
    severity: 'high' as const
  },
  {
    pattern: /\bits\s+a\s+good\s+idea\b/gi,
    suggestion: "it's a good idea",
    message: 'Use "it\'s" (contraction) for "it is"',
    type: 'grammar' as const,
    severity: 'medium' as const
  },
  {
    pattern: /\bcould\s+of\b/gi,
    suggestion: 'could have',
    message: 'Use "could have" instead of "could of"',
    type: 'grammar' as const,
    severity: 'high' as const
  },
  {
    pattern: /\bwould\s+of\b/gi,
    suggestion: 'would have',
    message: 'Use "would have" instead of "would of"',
    type: 'grammar' as const,
    severity: 'high' as const
  },
  {
    pattern: /\bshould\s+of\b/gi,
    suggestion: 'should have',
    message: 'Use "should have" instead of "should of"',
    type: 'grammar' as const,
    severity: 'high' as const
  },
  {
    pattern: /\bthere\s+house\b/gi,
    suggestion: 'their house',
    message: 'Use "their" (possessive) instead of "there"',
    type: 'grammar' as const,
    severity: 'high' as const
  },
  {
    pattern: /\byour\s+going\b/gi,
    suggestion: "you're going",
    message: 'Use "you\'re" (you are) instead of "your"',
    type: 'grammar' as const,
    severity: 'high' as const
  },
  {
    pattern: /\bto\s+much\b/gi,
    suggestion: 'too much',
    message: 'Use "too much" (excessive) instead of "to much"',
    type: 'grammar' as const,
    severity: 'high' as const
  },
  // Additional common mistakes
  {
    pattern: /\bwhos\s+there\b/gi,
    suggestion: "who's there",
    message: 'Use "who\'s" (who is) instead of "whose" when meaning "who is"',
    type: 'grammar' as const,
    severity: 'medium' as const
  },
  {
    pattern: /\bits\s+time\b/gi,
    suggestion: "it's time",
    message: 'Use "it\'s" (it is) instead of "its" when meaning "it is"',
    type: 'grammar' as const,
    severity: 'medium' as const
  },
  {
    pattern: /\bbetween\s+you\s+and\s+i\b/gi,
    suggestion: 'between you and me',
    message: 'Use "between you and me" (objective case) instead of "between you and I"',
    type: 'grammar' as const,
    severity: 'high' as const
  },
  {
    pattern: /\bi\s+seen\b/gi,
    suggestion: 'I saw',
    message: 'Use "I saw" instead of "I seen"',
    type: 'grammar' as const,
    severity: 'high' as const
  },
  {
    pattern: /\bme\s+and\s+(\w+)\s+(went|go|are|were)/gi,
    suggestion: '$1 and I $2',
    message: 'Use "I" as the subject instead of "me"',
    type: 'grammar' as const,
    severity: 'medium' as const
  }
];

// Common spelling mistakes
const spellingRules = [
  {
    pattern: /\bteh\b/gi,
    suggestion: 'the',
    message: 'Spelling error: "teh" should be "the"',
    type: 'spelling' as const,
    severity: 'high' as const
  },
  {
    pattern: /\brecieve\b/gi,
    suggestion: 'receive',
    message: 'Spelling error: "recieve" should be "receive" (i before e except after c)',
    type: 'spelling' as const,
    severity: 'high' as const
  },
  {
    pattern: /\boccured\b/gi,
    suggestion: 'occurred',
    message: 'Spelling error: "occured" should be "occurred" (double r)',
    type: 'spelling' as const,
    severity: 'high' as const
  },
  {
    pattern: /\bseperate\b/gi,
    suggestion: 'separate',
    message: 'Spelling error: "seperate" should be "separate" (a not e)',
    type: 'spelling' as const,
    severity: 'high' as const
  },
  {
    pattern: /\bdefinately\b/gi,
    suggestion: 'definitely',
    message: 'Spelling error: "definately" should be "definitely"',
    type: 'spelling' as const,
    severity: 'high' as const
  },
  {
    pattern: /\benviornment\b/gi,
    suggestion: 'environment',
    message: 'Spelling error: "enviornment" should be "environment"',
    type: 'spelling' as const,
    severity: 'high' as const
  },
  {
    pattern: /\bneccessary\b/gi,
    suggestion: 'necessary',
    message: 'Spelling error: "neccessary" should be "necessary" (one c, two s)',
    type: 'spelling' as const,
    severity: 'high' as const
  },
  {
    pattern: /\bexperiance\b/gi,
    suggestion: 'experience',
    message: 'Spelling error: "experiance" should be "experience"',
    type: 'spelling' as const,
    severity: 'high' as const
  },
  {
    pattern: /\bbelive\b/gi,
    suggestion: 'believe',
    message: 'Spelling error: "belive" should be "believe" (i before e)',
    type: 'spelling' as const,
    severity: 'high' as const
  },
  {
    pattern: /\bacommodate\b/gi,
    suggestion: 'accommodate',
    message: 'Spelling error: "acommodate" should be "accommodate" (double c, double m)',
    type: 'spelling' as const,
    severity: 'high' as const
  },
  {
    pattern: /\bmispelled\b/gi,
    suggestion: 'misspelled',
    message: 'Spelling error: "mispelled" should be "misspelled" (double s)',
    type: 'spelling' as const,
    severity: 'high' as const
  },
  {
    pattern: /\btounge\b/gi,
    suggestion: 'tongue',
    message: 'Spelling error: "tounge" should be "tongue"',
    type: 'spelling' as const,
    severity: 'high' as const
  },
  {
    pattern: /\bwierd\b/gi,
    suggestion: 'weird',
    message: 'Spelling error: "wierd" should be "weird" (e before i)',
    type: 'spelling' as const,
    severity: 'high' as const
  },
  {
    pattern: /\bgoverment\b/gi,
    suggestion: 'government',
    message: 'Spelling error: "goverment" should be "government" (n after r)',
    type: 'spelling' as const,
    severity: 'high' as const
  },
  {
    pattern: /\bpublic\b/gi,
    suggestion: 'public',
    message: 'Spelling error: "pubic" should be "public" (missing l)',
    type: 'spelling' as const,
    severity: 'high' as const
  }
];

// Style suggestions - much more variety
const styleRules = [
  // Very + adjective replacements
  {
    pattern: /\bvery\s+good\b/gi,
    suggestion: 'excellent',
    message: 'Consider using "excellent" instead of "very good" for stronger impact',
    type: 'style' as const,
    severity: 'low' as const
  },
  {
    pattern: /\bvery\s+bad\b/gi,
    suggestion: 'terrible',
    message: 'Consider using "terrible" instead of "very bad" for stronger impact',
    type: 'style' as const,
    severity: 'low' as const
  },
  {
    pattern: /\bvery\s+important\b/gi,
    suggestion: 'crucial',
    message: 'Consider using "crucial" instead of "very important" for stronger impact',
    type: 'style' as const,
    severity: 'low' as const
  },
  {
    pattern: /\bvery\s+big\b/gi,
    suggestion: 'enormous',
    message: 'Consider using "enormous" instead of "very big" for stronger impact',
    type: 'style' as const,
    severity: 'low' as const
  },
  {
    pattern: /\bvery\s+small\b/gi,
    suggestion: 'tiny',
    message: 'Consider using "tiny" instead of "very small" for stronger impact',
    type: 'style' as const,
    severity: 'low' as const
  },
  {
    pattern: /\bvery\s+fast\b/gi,
    suggestion: 'rapid',
    message: 'Consider using "rapid" instead of "very fast" for stronger impact',
    type: 'style' as const,
    severity: 'low' as const
  },
  {
    pattern: /\bvery\s+slow\b/gi,
    suggestion: 'sluggish',
    message: 'Consider using "sluggish" instead of "very slow" for stronger impact',
    type: 'style' as const,
    severity: 'low' as const
  },
  {
    pattern: /\bvery\s+happy\b/gi,
    suggestion: 'delighted',
    message: 'Consider using "delighted" instead of "very happy" for stronger impact',
    type: 'style' as const,
    severity: 'low' as const
  },
  {
    pattern: /\bvery\s+sad\b/gi,
    suggestion: 'devastated',
    message: 'Consider using "devastated" instead of "very sad" for stronger impact',
    type: 'style' as const,
    severity: 'low' as const
  },
  {
    pattern: /\bvery\s+tired\b/gi,
    suggestion: 'exhausted',
    message: 'Consider using "exhausted" instead of "very tired" for stronger impact',
    type: 'style' as const,
    severity: 'low' as const
  },
  
  // Wordy phrases
  {
    pattern: /\ba\s+lot\s+of\b/gi,
    suggestion: 'many',
    message: 'Consider using "many" instead of "a lot of" for more formal writing',
    type: 'style' as const,
    severity: 'low' as const
  },
  {
    pattern: /\bkind\s+of\b/gi,
    suggestion: 'somewhat',
    message: 'Consider using "somewhat" instead of "kind of" for more formal writing',
    type: 'style' as const,
    severity: 'low' as const
  },
  {
    pattern: /\breally\s+good\b/gi,
    suggestion: 'exceptional',
    message: 'Consider using "exceptional" instead of "really good" for stronger impact',
    type: 'style' as const,
    severity: 'low' as const
  },
  {
    pattern: /\bin\s+order\s+to\b/gi,
    suggestion: 'to',
    message: 'Consider using "to" instead of "in order to" for more concise writing',
    type: 'style' as const,
    severity: 'low' as const
  },
  {
    pattern: /\bdue\s+to\s+the\s+fact\s+that\b/gi,
    suggestion: 'because',
    message: 'Consider using "because" instead of "due to the fact that" for clearer writing',
    type: 'style' as const,
    severity: 'medium' as const
  },
  {
    pattern: /\bat\s+this\s+point\s+in\s+time\b/gi,
    suggestion: 'now',
    message: 'Consider using "now" instead of "at this point in time" for more concise writing',
    type: 'style' as const,
    severity: 'medium' as const
  },
  {
    pattern: /\bfor\s+the\s+purpose\s+of\b/gi,
    suggestion: 'to',
    message: 'Consider using "to" instead of "for the purpose of" for more concise writing',
    type: 'style' as const,
    severity: 'medium' as const
  },
  {
    pattern: /\bin\s+the\s+event\s+that\b/gi,
    suggestion: 'if',
    message: 'Consider using "if" instead of "in the event that" for clearer writing',
    type: 'style' as const,
    severity: 'medium' as const
  },
  {
    pattern: /\bwith\s+regard\s+to\b/gi,
    suggestion: 'regarding',
    message: 'Consider using "regarding" instead of "with regard to" for more concise writing',
    type: 'style' as const,
    severity: 'low' as const
  },
  {
    pattern: /\bas\s+a\s+matter\s+of\s+fact\b/gi,
    suggestion: 'actually',
    message: 'Consider using "actually" instead of "as a matter of fact" for more concise writing',
    type: 'style' as const,
    severity: 'low' as const
  },
  
  // Passive voice suggestions
  {
    pattern: /\bmistakes\s+were\s+made\b/gi,
    suggestion: 'we made mistakes',
    message: 'Consider using active voice for clearer responsibility',
    type: 'style' as const,
    severity: 'medium' as const
  },
  {
    pattern: /\bthe\s+decision\s+was\s+made\b/gi,
    suggestion: 'we decided',
    message: 'Consider using active voice for clearer communication',
    type: 'style' as const,
    severity: 'medium' as const
  },
  
  // Word choice improvements
  {
    pattern: /\bimpact\s+on\b/gi,
    suggestion: 'affect',
    message: 'Consider using "affect" instead of "impact on" (impact is a noun)',
    type: 'style' as const,
    severity: 'low' as const
  },
  {
    pattern: /\butilize\b/gi,
    suggestion: 'use',
    message: 'Consider using "use" instead of "utilize" for simpler language',
    type: 'style' as const,
    severity: 'low' as const
  },
  {
    pattern: /\bfacilitate\b/gi,
    suggestion: 'help',
    message: 'Consider using "help" instead of "facilitate" for clearer communication',
    type: 'style' as const,
    severity: 'low' as const
  },
  // Add specific weak adjective replacements
  {
    pattern: /\bvery\s+good\b/gi,
    suggestion: 'excellent',
    message: 'Consider using "excellent" instead of "very good"',
    type: 'style' as const,
    severity: 'low' as const
  },
  {
    pattern: /\bvery\s+bad\b/gi,
    suggestion: 'terrible',
    message: 'Consider using "terrible" instead of "very bad"',
    type: 'style' as const,
    severity: 'low' as const
  },
  {
    pattern: /\bvery\s+big\b/gi,
    suggestion: 'enormous',
    message: 'Consider using "enormous" instead of "very big"',
    type: 'style' as const,
    severity: 'low' as const
  },
  {
    pattern: /\bvery\s+small\b/gi,
    suggestion: 'tiny',
    message: 'Consider using "tiny" instead of "very small"',
    type: 'style' as const,
    severity: 'low' as const
  },
  {
    pattern: /\bvery\s+tired\b/gi,
    suggestion: 'exhausted',
    message: 'Consider using "exhausted" instead of "very tired"',
    type: 'style' as const,
    severity: 'low' as const
  },
  {
    pattern: /\bvery\s+happy\b/gi,
    suggestion: 'delighted',
    message: 'Consider using "delighted" instead of "very happy"',
    type: 'style' as const,
    severity: 'low' as const
  },
  {
    pattern: /\bvery\s+sad\b/gi,
    suggestion: 'devastated',
    message: 'Consider using "devastated" instead of "very sad"',
    type: 'style' as const,
    severity: 'low' as const
  },
  {
    pattern: /\bvery\s+angry\b/gi,
    suggestion: 'furious',
    message: 'Consider using "furious" instead of "very angry"',
    type: 'style' as const,
    severity: 'low' as const
  },
  {
    pattern: /\bvery\s+cold\b/gi,
    suggestion: 'freezing',
    message: 'Consider using "freezing" instead of "very cold"',
    type: 'style' as const,
    severity: 'low' as const
  },
  {
    pattern: /\bvery\s+hot\b/gi,
    suggestion: 'scorching',
    message: 'Consider using "scorching" instead of "very hot"',
    type: 'style' as const,
    severity: 'low' as const
  }
];

// Readability rules
const readabilityRules = [
  {
    pattern: /[^.!?]{150,}/g,
    suggestion: '', // This will be handled as advisory-only
    message: 'This sentence is quite long. Consider breaking it into shorter, clearer sentences for better readability.',
    type: 'readability' as const,
    severity: 'medium' as const,
    advisory: true // Flag to indicate this is advisory only
  },
  {
    pattern: /\b(\w+)\s+\1\b/gi,
    suggestion: '$1',
    message: 'Repeated word detected. Consider removing the duplicate.',
    type: 'readability' as const,
    severity: 'medium' as const
  },
  {
    pattern: /\band\s+and\b/gi,
    suggestion: 'and',
    message: 'Repeated "and" detected. Consider revising the sentence structure.',
    type: 'readability' as const,
    severity: 'low' as const
  },
  {
    pattern: /\bthat\s+that\b/gi,
    suggestion: 'that',
    message: 'Repeated "that" detected. Consider removing one for clarity.',
    type: 'readability' as const,
    severity: 'low' as const
  },
  {
    pattern: /\bthe\s+the\b/gi,
    suggestion: 'the',
    message: 'Repeated "the" detected. Consider removing the duplicate.',
    type: 'readability' as const,
    severity: 'medium' as const
  },
  {
    pattern: /\b(very\s+){2,}/gi,
    suggestion: 'very ',
    message: 'Multiple "very" words detected. Consider using a stronger adjective instead.',
    type: 'style' as const,
    severity: 'low' as const
  },
  // Add sentence variety suggestions (advisory only)
  {
    pattern: /(^|\. )(\w+\s+){1,3}\w+\. (\w+\s+){1,3}\w+\. (\w+\s+){1,3}\w+\./gm,
    suggestion: '',
    message: 'Multiple short sentences in a row. Consider combining some for better flow.',
    type: 'style' as const,
    severity: 'low' as const,
    advisory: true
  },
  // Add passive voice detection with actual replacements where possible
  {
    pattern: /\bwas\s+([\w]+ed)\s+by\s+(\w+)/gi,
    suggestion: '$2 $1',
    message: 'Passive voice detected. Consider active voice: "$2 $1"',
    type: 'style' as const,
    severity: 'low' as const
  },
  {
    pattern: /\bwere\s+([\w]+ed)\s+by\s+(\w+)/gi,
    suggestion: '$2 $1',
    message: 'Passive voice detected. Consider active voice: "$2 $1"',
    type: 'style' as const,
    severity: 'low' as const
  },
  {
    pattern: /\bis\s+([\w]+ed)\s+by\s+(\w+)/gi,
    suggestion: '$2 $1s',
    message: 'Passive voice detected. Consider active voice: "$2 $1s"',
    type: 'style' as const,
    severity: 'low' as const
  },
  // Add filler word detection (actual removal)
  {
    pattern: /\breally\s+/gi,
    suggestion: '',
    message: 'Consider removing "really" to make your writing more concise.',
    type: 'style' as const,
    severity: 'low' as const
  },
  {
    pattern: /\bactually\s+/gi,
    suggestion: '',
    message: 'Consider removing "actually" to make your writing more concise.',
    type: 'style' as const,
    severity: 'low' as const
  },
  {
    pattern: /\bbasically\s+/gi,
    suggestion: '',
    message: 'Consider removing "basically" to make your writing more concise.',
    type: 'style' as const,
    severity: 'low' as const
  },
  {
    pattern: /\bliterally\s+/gi,
    suggestion: '',
    message: 'Consider removing "literally" unless used for literal meaning.',
    type: 'style' as const,
    severity: 'low' as const
  },
  {
    pattern: /\bjust\s+/gi,
    suggestion: '',
    message: 'Consider removing "just" to make your writing more direct.',
    type: 'style' as const,
    severity: 'low' as const
  },
  {
    pattern: /\bsimply\s+/gi,
    suggestion: '',
    message: 'Consider removing "simply" to make your writing more concise.',
    type: 'style' as const,
    severity: 'low' as const
  },
  {
    pattern: /\bquite\s+/gi,
    suggestion: '',
    message: 'Consider removing "quite" or using a stronger adjective.',
    type: 'style' as const,
    severity: 'low' as const
  },
  {
    pattern: /\brather\s+/gi,
    suggestion: '',
    message: 'Consider removing "rather" or using a more specific word.',
    type: 'style' as const,
    severity: 'low' as const
  },
  {
    pattern: /\bsomewhat\s+/gi,
    suggestion: '',
    message: 'Consider removing "somewhat" or being more specific.',
    type: 'style' as const,
    severity: 'low' as const
  },
  {
    pattern: /\bfairly\s+/gi,
    suggestion: '',
    message: 'Consider removing "fairly" or using a stronger adjective.',
    type: 'style' as const,
    severity: 'low' as const
  },
  {
    pattern: /\bpretty\s+(?![\w]*ly\b)/gi, // Don't match "pretty" in "prettily"
    suggestion: '',
    message: 'Consider removing "pretty" or using a more specific adjective.',
    type: 'style' as const,
    severity: 'low' as const
  }
];

// Punctuation and formatting rules
const punctuationRules = [
  {
    pattern: /\s+,/g,
    suggestion: ',',
    message: 'Remove space before comma',
    type: 'grammar' as const,
    severity: 'medium' as const
  },
  {
    pattern: /\s+\./g,
    suggestion: '.',
    message: 'Remove space before period',
    type: 'grammar' as const,
    severity: 'medium' as const
  },
  {
    pattern: /,(\S)/g,
    suggestion: ', $1',
    message: 'Add space after comma',
    type: 'grammar' as const,
    severity: 'medium' as const
  },
  {
    pattern: /\.(\w)/g,
    suggestion: '. $1',
    message: 'Add space after period',
    type: 'grammar' as const,
    severity: 'medium' as const
  },
  {
    pattern: /\s{2,}/g,
    suggestion: ' ',
    message: 'Remove extra spaces',
    type: 'style' as const,
    severity: 'low' as const
  },
  {
    pattern: /\n{3,}/g,
    suggestion: '\n\n',
    message: 'Remove extra line breaks',
    type: 'style' as const,
    severity: 'low' as const
  },
  {
    pattern: /([.!?])\s*([a-z])/g,
    suggestion: '$1 $2',
    message: 'Capitalize the first word after a sentence-ending punctuation',
    type: 'grammar' as const,
    severity: 'medium' as const
  }
];

// Additional common phrases and improvements
const commonPhraseRules = [
  {
    pattern: /\bon\s+a\s+daily\s+basis\b/gi,
    suggestion: 'daily',
    message: 'Consider using "daily" instead of "on a daily basis" for conciseness',
    type: 'style' as const,
    severity: 'low' as const
  },
  {
    pattern: /\bfirst\s+and\s+foremost\b/gi,
    suggestion: 'first',
    message: 'Consider using "first" instead of "first and foremost" for conciseness',
    type: 'style' as const,
    severity: 'low' as const
  },
  {
    pattern: /\bfree\s+gift\b/gi,
    suggestion: 'gift',
    message: 'A gift is already free by definition. Consider using just "gift"',
    type: 'style' as const,
    severity: 'low' as const
  },
  {
    pattern: /\bfuture\s+plans\b/gi,
    suggestion: 'plans',
    message: 'Plans are for the future by definition. Consider using just "plans"',
    type: 'style' as const,
    severity: 'low' as const
  },
  {
    pattern: /\bunexpected\s+surprise\b/gi,
    suggestion: 'surprise',
    message: 'A surprise is unexpected by definition. Consider using just "surprise"',
    type: 'style' as const,
    severity: 'low' as const
  },
  {
    pattern: /\bclose\s+proximity\b/gi,
    suggestion: 'proximity',
    message: 'Proximity implies closeness. Consider using just "proximity"',
    type: 'style' as const,
    severity: 'low' as const
  }
];

export function checkText(text: string): GrammarSuggestion[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  console.log('Grammar Checker: Analyzing text:', {
    length: text.length,
    preview: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
    wordCount: text.trim().split(/\s+/).length
  });

  const suggestions: GrammarSuggestion[] = [];
  const allRules = [
    ...grammarRules, 
    ...spellingRules, 
    ...styleRules, 
    ...readabilityRules, 
    ...punctuationRules,
    ...commonPhraseRules
  ];

  console.log('Grammar Checker: Total rules available:', {
    grammar: grammarRules.length,
    spelling: spellingRules.length,
    style: styleRules.length,
    readability: readabilityRules.length,
    punctuation: punctuationRules.length,
    commonPhrase: commonPhraseRules.length,
    total: allRules.length
  });

  allRules.forEach((rule, ruleIndex) => {
    // Create a new regex instance for each rule to avoid lastIndex issues
    const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      const suggestion: GrammarSuggestion = {
        id: `${ruleIndex}-${match.index}-${Date.now()}-${Math.random()}`,
        type: rule.type,
        start: match.index,
        end: match.index + match[0].length,
        original: match[0],
        suggestion: rule.suggestion.replace(/\$1/g, match[1] || '').trim() || match[0],
        message: rule.message,
        severity: rule.severity
      };
      suggestions.push(suggestion);
      
      console.log('Grammar Checker: Found suggestion:', {
        type: rule.type,
        severity: rule.severity,
        original: match[0],
        suggestion: suggestion.suggestion,
        message: rule.message.substring(0, 50) + '...'
      });
      
      // For non-global patterns, break after first match
      if (!rule.pattern.global) break;
    }
  });

  // Sort suggestions by position in text and remove duplicates
  const uniqueSuggestions = suggestions.filter((suggestion, index, arr) => 
    arr.findIndex(s => s.start === suggestion.start && s.end === suggestion.end) === index
  );

  console.log('Grammar Checker: Final results:', {
    totalSuggestions: suggestions.length,
    uniqueSuggestions: uniqueSuggestions.length,
    byType: uniqueSuggestions.reduce((acc, s) => {
      acc[s.type] = (acc[s.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    bySeverity: uniqueSuggestions.reduce((acc, s) => {
      acc[s.severity] = (acc[s.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  });

  return uniqueSuggestions.sort((a, b) => a.start - b.start);
}

export function applySuggestion(text: string, suggestion: GrammarSuggestion): string {
  console.log('Applying suggestion:', {
    original: suggestion.original,
    suggestion: suggestion.suggestion,
    start: suggestion.start,
    end: suggestion.end,
    textLength: text.length,
    type: suggestion.type,
    severity: suggestion.severity
  });

  // Don't apply advisory-only suggestions (they're for information only)
  if (!suggestion.suggestion || 
      suggestion.suggestion.trim() === '' || 
      suggestion.suggestion === suggestion.original ||
      (suggestion.suggestion.startsWith('[') && suggestion.suggestion.endsWith(']')) ||
      suggestion.suggestion.toLowerCase().includes('consider') ||
      suggestion.suggestion.toLowerCase().includes('try to') ||
      suggestion.suggestion.toLowerCase().includes('you might')) {
    console.log('Skipping advisory-only suggestion:', suggestion.suggestion);
    return text;
  }

  // First, try the exact positions provided
  if (suggestion.start >= 0 && suggestion.end <= text.length && suggestion.start < suggestion.end) {
    const originalTextAtPosition = text.substring(suggestion.start, suggestion.end);
    if (originalTextAtPosition === suggestion.original) {
      // Perfect match - apply the suggestion
      const before = text.substring(0, suggestion.start);
      const after = text.substring(suggestion.end);
      const newText = before + suggestion.suggestion + after;
      
      console.log('Successfully applied suggestion at exact positions:', {
        before: before.slice(-10),
        replacement: suggestion.suggestion,
        after: after.slice(0, 10),
        newLength: newText.length
      });
      
      return newText;
    } else {
      console.warn('Original text mismatch at provided positions:', {
        expected: suggestion.original,
        actual: originalTextAtPosition,
        position: `${suggestion.start}-${suggestion.end}`
      });
    }
  } else {
    console.warn('Invalid suggestion positions:', {
      start: suggestion.start,
      end: suggestion.end,
      textLength: text.length
    });
  }

  // Fallback 1: Try to find exact match of the original text
  const exactIndex = text.indexOf(suggestion.original);
  if (exactIndex !== -1) {
    console.log('Found exact match at different position:', exactIndex);
    const before = text.substring(0, exactIndex);
    const after = text.substring(exactIndex + suggestion.original.length);
    const newText = before + suggestion.suggestion + after;
    
    console.log('Successfully applied suggestion at found position:', {
      foundAt: exactIndex,
      replacement: suggestion.suggestion,
      newLength: newText.length
    });
    
    return newText;
  }

  // Fallback 2: Try case-insensitive match
  const lowerText = text.toLowerCase();
  const lowerOriginal = suggestion.original.toLowerCase();
  const caseInsensitiveIndex = lowerText.indexOf(lowerOriginal);
  if (caseInsensitiveIndex !== -1) {
    console.log('Found case-insensitive match at position:', caseInsensitiveIndex);
    const before = text.substring(0, caseInsensitiveIndex);
    const after = text.substring(caseInsensitiveIndex + suggestion.original.length);
    const newText = before + suggestion.suggestion + after;
    
    console.log('Successfully applied suggestion with case-insensitive match');
    return newText;
  }

  // Fallback 3: Try trimmed versions (handle extra whitespace)
  const trimmedOriginal = suggestion.original.trim();
  const trimmedIndex = text.indexOf(trimmedOriginal);
  if (trimmedIndex !== -1 && trimmedOriginal.length > 0) {
    console.log('Found trimmed match at position:', trimmedIndex);
    const before = text.substring(0, trimmedIndex);
    const after = text.substring(trimmedIndex + trimmedOriginal.length);
    const newText = before + suggestion.suggestion + after;
    
    console.log('Successfully applied suggestion with trimmed match');
    return newText;
  }

  // Fallback 4: Try fuzzy matching for close matches (handle extra spaces, punctuation, etc.)
  const words = suggestion.original.split(/\s+/).filter(w => w.length > 0);
  if (words.length > 1) {
    // Try to match just the key words
    const keyWords = words.filter(word => word.length > 2); // Skip short words like "is", "a", etc.
    if (keyWords.length > 0) {
      const keyWordPattern = keyWords.map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*?');
      const regex = new RegExp(keyWordPattern, 'i');
      const match = text.match(regex);
      if (match && match.index !== undefined) {
        console.log('Found fuzzy match with key words:', match[0]);
        const before = text.substring(0, match.index);
        const after = text.substring(match.index + match[0].length);
        const newText = before + suggestion.suggestion + after;
        
        console.log('Successfully applied suggestion with fuzzy matching');
        return newText;
      }
    }
  }

  // Fallback 5: For single word replacements, try word boundary matching
  if (!suggestion.original.includes(' ') && suggestion.original.length > 2) {
    const wordBoundaryRegex = new RegExp(`\\b${suggestion.original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    const match = text.match(wordBoundaryRegex);
    if (match && match.index !== undefined) {
      console.log('Found word boundary match:', match[0]);
      const before = text.substring(0, match.index);
      const after = text.substring(match.index + match[0].length);
      const newText = before + suggestion.suggestion + after;
      
      console.log('Successfully applied suggestion with word boundary matching');
      return newText;
    }
  }

  // Fallback 6: For AI suggestions that might be trying to replace the entire text
  if (suggestion.start === 0 && suggestion.end >= text.length - 2) {
    console.log('Suggestion appears to be for entire text, applying as full replacement');
    return suggestion.suggestion;
  }

  console.error('Could not find original text to replace, all fallback methods failed:', {
    originalText: suggestion.original,
    suggestionText: suggestion.suggestion,
    textPreview: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
    suggestionType: suggestion.type,
    severity: suggestion.severity
  });
  
  // Return original text unchanged if we can't apply the suggestion
  return text;
}

export function getTextStats(text: string) {
  if (!text || text.trim().length === 0) {
    return {
      words: 0,
      characters: 0,
      charactersNoSpaces: 0,
      sentences: 0,
      paragraphs: 0,
      avgWordsPerSentence: 0,
      readabilityScore: 100
    };
  }

  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  
  const avgWordsPerSentence = sentences.length > 0 ? words.length / sentences.length : 0;
  const avgCharsPerWord = words.length > 0 ? charactersNoSpaces / words.length : 0;
  
  // Simple readability score (Flesch Reading Ease approximation)
  const readabilityScore = sentences.length > 0 && words.length > 0 
    ? 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgCharsPerWord / 4.7)
    : 100;

  return {
    words: words.length,
    characters,
    charactersNoSpaces,
    sentences: sentences.length,
    paragraphs: paragraphs.length,
    avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
    readabilityScore: Math.max(0, Math.min(100, Math.round(readabilityScore)))
  };
} 