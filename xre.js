// https://github.com/jawj/xre
// Copyright (C) George MacKerron 2010 - 2017
// MIT licenced

const xRE = (function () {
  
  function xRE(literals, ...values) {  // tag function that returns a tag function
    return (flagLiterals, ...flagValues) => {
      const flags = reassembleTemplate(flagLiterals, flagValues);
      const x = flags.indexOf('x') > -1;
      const mm = flags.indexOf('mm') > -1;
      const escapeValues = flags.indexOf('b') > -1;
      const valueTransform = escapeValues ? xRE.escape : undefined;
      const extendedSource = reassembleTemplate(
        literals, values, true, undefined, valueTransform);
      const nativeSource = transpile(extendedSource, x, mm);
      const nativeFlags = flags.replace(/x|b/g, '').replace('mm', 'm');
      return new RegExp(nativeSource, nativeFlags);
    }
  }

  xRE.escape = (source) =>
    String(source).replace(/[-\/\\^$.*+?()[\]{}|]/g, '\\$&');

  reassembleTemplate = (literals, values, raw = false,
    literalTransform = String, valueTransform = String) => {
    if (typeof literals === 'string') return literals;
    if (raw) literals = literals.raw;
    let s = literalTransform(literals[0]);
    for (let i = 1, len = literals.length; i < len; i++) s +=
      valueTransform(values[i - 1]) + literalTransform(literals[i]);
    return s;
  }

  transpile = (source, x, m) => {
    if (!x && !m) return source;
    const len = source.length;
    let convertedSource = '', inCharClass = false, inComment = false, justBackslashed = false;
    for (let i = 0; i < len; i++) {
      let c = source.charAt(i);
      if (justBackslashed) {
        if (!inComment) convertedSource += c;
        justBackslashed = false;
        continue;
      }
      if (c == '\\') {
        if (!inComment) convertedSource += c;
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
      if (x && c == '#') {
        inComment = true;
        continue;
      }
      if (m && c == '.') {
        convertedSource += '[\\s\\S]';
        continue;
      }
      if (!x || !c.match(/\s/)) convertedSource += c;
    }
    return convertedSource;
  }

  return xRE;
})();

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') module.exports = xRE;
