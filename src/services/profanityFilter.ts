// Create a simple profanity filter service
class ProfanityFilter {
  private badWords: Set<string>;

  constructor() {
    // Common bad words and variations
    this.badWords = new Set([
      'fuck', 'fucking', 'fucked', 'fck', 'f*ck', 'fuk',
      'shit', 'sh*t', 'shyt',
      'ass', 'asshole', 'a$$',
      'bitch', 'b*tch',
      'dick', 'd*ck',
      'pussy', 'p*ssy',
      'cock', 'c*ck',
      'damn', 'dammit',
      'bastard',
      'cunt', 'c*nt',
      // Add more as needed
    ]);
  }

  cleanText(text: string): { cleaned: string; wasFiltered: boolean } {
    if (!text) return { cleaned: '', wasFiltered: false };

    let wasFiltered = false;
    // Split text into words while preserving punctuation and spaces
    let cleaned = text.split(/\b/).map(part => {
      const lowerPart = part.toLowerCase().trim();
      if (this.badWords.has(lowerPart)) {
        wasFiltered = true;
        return '❤️';  // Replace with heart emoji instead of asterisks
      }
      return part;
    }).join('');

    return { cleaned, wasFiltered };
  }

  // Method to add custom bad words
  addWords(...words: string[]) {
    words.forEach(word => this.badWords.add(word.toLowerCase()));
  }

  // Method to remove words from the filter
  removeWords(...words: string[]) {
    words.forEach(word => this.badWords.delete(word.toLowerCase()));
  }
}

export const profanityFilter = new ProfanityFilter();

// Add any additional bad words
profanityFilter.addWords(
  'badword3',
  'badword4'
  // Add more words as needed
); 