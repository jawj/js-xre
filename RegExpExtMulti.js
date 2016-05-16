RegExp.convertSourceExtMulti = function(source, ext, multi) {  // string, boolean, boolean
  if (! ext && ! multi) return source;
  var convertedSource = '';
  var inCharClass = false, inComment = false, justBackslashed = false;
  for (var i = 0, len = source.length; i < len; i ++) {
    var c = source.charAt(i);
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
    if (ext && c == '#') {
      inComment = true;
      continue;
    }
    if (multi && c == '.') {
      convertedSource += '[\\s\\S]';
      continue;
    }
    if (! ext || ! c.match(/\s/)) convertedSource += c;
  }
  return convertedSource;
}
