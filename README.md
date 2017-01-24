# JS-RegExp-Extended-MultiLine

Extended (and genuinely-multi-line) Regular Expressions for JavaScript. Details at http://blog.mackerron.com/2010/08/08/extended-multi-line-js-regexps/.

Now available for TypeScript, where tagged template strings make them especially usable. The syntax is:

    xRegExp`myregexp`('flags');

And the flags `x` and `mm` are made available for extended and multline, in addition to the standard flags (`i`, `g`, etc.) which are simply passed through.

For example:

    const syncCodeRegExp = xRegExp`
      ^
      \s*
      ([^.]+)      # code 1
      [.]
      ([^.]+)      # code 2
      [.]
      ([0-9]{6})   # random seed
      [.]
      ([0-9]{4})   # start time
      [.]
      ([^.]{1,3})  # check digits
      \s*
      $
    `('xi');
    
    console.log(syncCodeRegExp);  // -> /^\s*([^.]+)[.]([^.]+)[.]([0-9]{6})[.]([0-9]{4})[.]([^.]{1,3})\s*$/i
    
