import { Video } from '@/types/video';

// ============================================================================
// Types
// ============================================================================

interface SearchTerm {
  value: string;
  exclude: boolean;
  isYearRange: boolean;
  yearRange?: { start: number; end: number };
}

interface SearchGroup {
  terms: SearchTerm[];
}

// ============================================================================
// Constants
// ============================================================================

const YEAR_RANGE_PATTERN = /^(\d{4})-(\d{4})$/;
const SINGLE_YEAR_PATTERN = /^(\d{4})$/;
const YEAR_COMPARISON_PATTERN = /^([<>]=?)(\d{4})$/;

// ============================================================================
// Tokenizer - Simplified approach
// ============================================================================

interface ParsedToken {
  type: 'term' | 'or' | 'lparen' | 'rparen';
  value: string;
  exclude: boolean;
}

/**
 * Tokenize and identify exclusions in one pass.
 * Returns tokens with exclusion already attached to terms.
 */
function tokenize(query: string): ParsedToken[] {
  const tokens: ParsedToken[] = [];
  let i = 0;
  let pendingExclude = false;

  while (i < query.length) {
    const char = query[i];

    // Skip whitespace
    if (/\s/.test(char)) {
      i++;
      pendingExclude = false; // Reset exclusion on whitespace unless it's between - and term
      continue;
    }

    // OR operator: | or ||
    if (char === '|') {
      if (query[i + 1] === '|') {
        tokens.push({ type: 'or', value: '||', exclude: false });
        i += 2;
      } else {
        tokens.push({ type: 'or', value: '|', exclude: false });
        i++;
      }
      pendingExclude = false;
      continue;
    }

    // Parentheses
    if (char === '(') {
      tokens.push({ type: 'lparen', value: '(', exclude: pendingExclude });
      pendingExclude = false;
      i++;
      continue;
    }

    if (char === ')') {
      tokens.push({ type: 'rparen', value: ')', exclude: false });
      pendingExclude = false;
      i++;
      continue;
    }

    // Minus (exclusion prefix)
    if (char === '-') {
      const next = query[i + 1];
      // Only treat as exclusion if followed by something valid
      if (next && (next === '(' || next === '"' || /[^\s|)]/.test(next))) {
        pendingExclude = true;
        i++;
        continue;
      }
    }

    // Quoted string
    if (char === '"') {
      let value = '';
      i++; // skip opening quote
      while (i < query.length && query[i] !== '"') {
        value += query[i];
        i++;
      }
      i++; // skip closing quote
      if (value) {
        tokens.push({ type: 'term', value, exclude: pendingExclude });
        pendingExclude = false;
      }
      continue;
    }

    // Regular term
    let value = '';
    while (i < query.length && !/[\s|()"]/.test(query[i])) {
      value += query[i];
      i++;
    }
    if (value) {
      tokens.push({ type: 'term', value, exclude: pendingExclude });
      pendingExclude = false;
    }
  }

  return tokens;
}

// ============================================================================
// Parser
// ============================================================================

function parseYearRange(term: string): { start: number; end: number } | null {
  // Check for year range (2020-2021)
  const rangeMatch = term.match(YEAR_RANGE_PATTERN);
  if (rangeMatch) {
    const start = parseInt(rangeMatch[1], 10);
    const end = parseInt(rangeMatch[2], 10);

    if (start < 1900 || start > 2100 || end < 1900 || end > 2100) {
      return null;
    }

    return {
      start: Math.min(start, end),
      end: Math.max(start, end),
    };
  }

  // Check for comparison operators (<2025, >2020, <=2025, >=2020)
  const compMatch = term.match(YEAR_COMPARISON_PATTERN);
  if (compMatch) {
    const operator = compMatch[1];
    const year = parseInt(compMatch[2], 10);

    if (year < 1900 || year > 2100) {
      return null;
    }

    switch (operator) {
      case '<':
        return { start: 1900, end: year - 1 };
      case '<=':
        return { start: 1900, end: year };
      case '>':
        return { start: year + 1, end: 2100 };
      case '>=':
        return { start: year, end: 2100 };
    }
  }

  // Check for single year (2025)
  const singleMatch = term.match(SINGLE_YEAR_PATTERN);
  if (singleMatch) {
    const year = parseInt(singleMatch[1], 10);

    if (year < 1900 || year > 2100) {
      return null;
    }

    return { start: year, end: year };
  }

  return null;
}

function createSearchTerm(value: string, exclude: boolean): SearchTerm {
  const yearRange = parseYearRange(value);
  return {
    value,
    exclude,
    isYearRange: yearRange !== null,
    yearRange: yearRange ?? undefined,
  };
}

/**
 * Parse tokens into groups.
 * OR-connected terms form a single group.
 * Spaces (implicit AND) separate groups.
 */
function parseSearchQuery(query: string): SearchGroup[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];

  const groups: SearchGroup[] = [];
  let i = 0;

  while (i < tokens.length) {
    const result = parseGroup(tokens, i);
    if (result.group.terms.length > 0) {
      groups.push(result.group);
    }
    i = result.nextIndex;
  }

  return groups;
}

function parseGroup(
  tokens: ParsedToken[],
  startIndex: number
): { group: SearchGroup; nextIndex: number } {
  const terms: SearchTerm[] = [];
  let i = startIndex;

  // Handle parenthesized group (possibly with exclusion)
  if (tokens[i]?.type === 'lparen') {
    const groupExclude = tokens[i].exclude;
    i++; // skip LPAREN

    // Collect all terms until RPAREN
    while (i < tokens.length && tokens[i].type !== 'rparen') {
      if (tokens[i].type === 'term') {
        // XOR exclusion: group exclude XOR term exclude
        const finalExclude = groupExclude !== tokens[i].exclude;
        terms.push(createSearchTerm(tokens[i].value, finalExclude));
        i++;
      } else if (tokens[i].type === 'or') {
        i++; // skip OR
      } else if (tokens[i].type === 'lparen') {
        // Nested parens
        const nested = parseGroup(tokens, i);
        for (const term of nested.group.terms) {
          terms.push({
            ...term,
            exclude: groupExclude !== term.exclude,
          });
        }
        i = nested.nextIndex;
      } else {
        i++;
      }
    }

    if (tokens[i]?.type === 'rparen') {
      i++; // skip RPAREN
    }

    return { group: { terms }, nextIndex: i };
  }

  // Non-parenthesized: collect all OR-connected terms
  while (i < tokens.length) {
    const token = tokens[i];

    if (token.type === 'term') {
      terms.push(createSearchTerm(token.value, token.exclude));
      i++;

      // Check if followed by OR
      if (tokens[i]?.type === 'or') {
        i++; // skip OR, continue collecting
        continue;
      }
      // Not followed by OR - group complete
      break;
    } else if (token.type === 'or') {
      // Leading/orphan OR - skip and continue
      i++;
      continue;
    } else {
      // Hit paren or end
      break;
    }
  }

  return { group: { terms }, nextIndex: i };
}

// ============================================================================
// Matching Logic
// ============================================================================

/**
 * Get fields that support substring matching.
 * Channel title is excluded - it requires exact match.
 */
function getSubstringSearchableFields(video: Video): string[] {
  const fields: string[] = [
    video.title,
    video.description,
    video.playlistName,
    video.categoryName,
  ];

  if (video.metadata?.members) {
    fields.push(...video.metadata.members);
  }

  if (video.metadata?.location) {
    fields.push(video.metadata.location);
  }

  if (video.metadata?.series) {
    fields.push(video.metadata.series);
  }

  if (video.tags) {
    fields.push(...video.tags);
  }

  if (video.metadata?.tags) {
    fields.push(...video.metadata.tags);
  }

  return fields.filter(Boolean);
}

function videoMatchesYearRange(
  video: Video,
  yearRange: { start: number; end: number }
): boolean {
  const dateStr = video.displayDate;
  if (!dateStr) return false;

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return false;

  const year = date.getFullYear();
  return year >= yearRange.start && year <= yearRange.end;
}

function valueMatchesVideo(video: Video, value: string): boolean {
  const lowerValue = value.toLowerCase();

  // Channel title requires exact match (case-insensitive)
  if (video.channelTitle?.toLowerCase() === lowerValue) {
    return true;
  }

  // Other fields support substring matching
  const fields = getSubstringSearchableFields(video);
  return fields.some((field) => field.toLowerCase().includes(lowerValue));
}

function termValueMatchesVideo(video: Video, term: SearchTerm): boolean {
  if (term.isYearRange && term.yearRange) {
    return (
      videoMatchesYearRange(video, term.yearRange) ||
      valueMatchesVideo(video, term.value)
    );
  }
  return valueMatchesVideo(video, term.value);
}

/**
 * Check if a group matches a video.
 *
 * True OR logic where each term is a condition:
 * - Positive term "cat": true if video has "cat"
 * - Negative term "-dog": true if video does NOT have "dog"
 *
 * The group matches if ANY term's condition is true.
 *
 * Examples:
 * - "cat | dog" → has cat OR has dog
 * - "cat | -dog" → has cat OR doesn't have dog
 * - "-cat | -dog" → doesn't have cat OR doesn't have dog
 */
function groupMatchesVideo(video: Video, group: SearchGroup): boolean {
  if (group.terms.length === 0) return true;

  // OR logic: any term's condition being true = group matches
  return group.terms.some((term) => {
    const matches = termValueMatchesVideo(video, term);
    // For positive terms: true if matches
    // For negative terms: true if does NOT match
    return term.exclude ? !matches : matches;
  });
}

// ============================================================================
// Main Export
// ============================================================================

/**
 * Enhanced search filter for videos.
 *
 * Features:
 * - Year range: "2020-2021" matches videos from those years
 * - Cross-field: terms can match title, members, tags, etc.
 * - Exclusion: "-boring" excludes videos containing "boring"
 * - OR logic: "cat | dog" matches videos with either term
 * - Grouping: "(cat | dog) mouse" for explicit precedence
 * - Quoted phrases: "exact phrase"
 * - Mixed: "cat | -dog" = has cat AND not dog (order doesn't matter)
 *
 * OR binds tighter than AND:
 * "cat | dog mouse" = "(cat OR dog) AND mouse"
 */
export function searchVideos(videos: Video[], searchQuery: string): Video[] {
  const query = searchQuery.trim();
  if (!query) return videos;

  const groups = parseSearchQuery(query);
  if (groups.length === 0) return videos;

  return videos.filter((video) =>
    groups.every((group) => groupMatchesVideo(video, group))
  );
}
