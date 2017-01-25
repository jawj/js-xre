
function transpileRE(source: string, extended: boolean, multiline: boolean): string {
  if (! extended && ! multiline) return source;
  const len = source.length;
  let convertedSource = '', inCharClass = false, inComment = false, justBackslashed = false;
  for (let i = 0; i < len; i ++) {
    let c = source.charAt(i);
    if (justBackslashed) {
      if (! inComment) convertedSource += c;
      justBackslashed = false;
      continue;
    }
    if (c == '\\') {
      if (! inComment) convertedSource += c;
      justBackslashed = true;
      continue;
    }
    if (inCharClass) {
      convertedSource += c;
      if (c == ']') inCharClass = false;
      continue;
    }
    if (inComment) {
      if (c == "\n" || c == "\r") inComment = false;
      continue;
    }
    if (c == '[') {
      convertedSource += c;
      inCharClass = true;
      continue;
    }
    if (extended && c == '#') {
      inComment = true;
      continue;
    }
    if (multiline && c == '.') {
      convertedSource += '[\\s\\S]';
      continue;
    }
    if (! extended || ! c.match(/\s/)) convertedSource += c;
  }
  return convertedSource;
}

function reassembleRE(literals: TemplateStringsArray, values: any[], escapeValues: boolean): string {
  const rawLiterals = literals.raw
  let source = '', value: string; 
  for (let i = 0, len = rawLiterals.length; i < len; i ++) {
    source += rawLiterals[i];
    if (value = values[i]) source += escapeValues ? xRegExp.escape(String(value)) : String(value);
  }
  return source;
}

export function xRegExp(literals: TemplateStringsArray, ... values) {
  return (flags: string = ''): RegExp => {
    const x = flags.indexOf('x') != -1;
    const mm = flags.indexOf('mm') != -1;
    const escapeValues = flags.indexOf('\\') != -1;
    const source = transpileRE(reassembleRE(literals, values, escapeValues), x, mm);
    const nativeFlags = flags.replace(/x|\\/g, '').replace('mm', 'm');
    return new RegExp(source, nativeFlags);
  }
}

export namespace xRegExp {
  export function escape(source: string): string {
    return source.replace(/[-\/\\^$.*+?()[\]{}|]/g, '\\$&');
  }
}

export default xRegExp;
