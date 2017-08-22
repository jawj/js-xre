# xRE: extended RegExps for JavaScript ES2015+

Extended (and genuinely-multi-line) Regular Expressions in JavaScript using ES2015+ tagged template strings. 

## Installation

For browser-side use:

`<script src="js-xre.js"></script>`. 

For use with node:

`npm install js-xre`.

## What's an extended RegExp?

Perl, Ruby, and some other languages support a readable _extended_ regular expression syntax, in which literal whitespace is ignored and comments (starting with `#`) are available. This is triggered with the `x` flag.

(Don't confuse this with the 'extended' expressions of `egrep`, which are just modern regular expressions. The sort of extended expressions I am talking about might perhaps be better be described as _commented_ or even _literate_).

For example, as far as Ruby is concerned,

```
/\d(?=(\d{3})+\b)/
```

and

```
/ \d          # a digit
  (?=         # followed by (look-ahead match)
    (\d{3})+  # one or more sets of three digits
    \b        # and then a word boundary
  )
/x
```

are equivalent. For humans, however, the extended second version is obviously much easier to get to grips with.

These languages also support a properly multi-line match mode, where the `.` character really does match anything, including `\n`.

## JS: no dice —

JavaScript traditionally offers neither of these options. 

It doesn’t recognise the extended syntax, and its multi-line support consists only in permitting the `^` and `$` characters to match the beginnings and ends of lines within a string. It will never allow the `.` to match `\n`.

I first wrote a function to convert extended and fully-multi-line RegExp source strings to standard syntax [in 2010](http://blog.mackerron.com/2010/08/08/extended-multi-line-js-regexps/). But it was tricky and error-prone to use it, because a standard JS string can't span multiple lines and you would have to backslash-escape all the backslashes.

## — until now

ES2015's pleasingly flexible [tagged template literals](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Template_literals) now make this a genuinely usable and useful capability. 

As implemented here, the syntax is:

```
xRE `myregexp` `flags`
```

(Note: the `flags` literal is required — to specify no flags, use an empty literal, ``` `` ```).

In addition to the standard flags (`i`, `g`, `m`, `y`, `u`), which are passed straight through to the native `RegExp`, three additional flags are provided:

* `x` activates extended mode, stripping out whitespace and comments
* `mm` activates genuinely-multi-line mode, where `.` matches anything, including newlines (achieved by replacing `.` with `[\s\S]`)
* `b` is for backslashes, and automatically escapes all template expressions so they are treated as literal text (alternatively, an `xRE.escape` method is provided so this can be done case-by-case).

## Alternatives

You should also check out [XRegExp](http://xregexp.com/), an impressive library that takes a rather more and-the-kitchen-sink approach.

This library is small and focused. It's < 1KB gzipped, compared to XRegExp's 62 KB.


## Examples

### `x` for extended

An simple example with the extended flag `x`:

```js
const xRE = require('js-xre');

const digitsThatNeedSeparators = xRE `
  \d          # a digit
  (?=         # followed by (look-ahead match)
    (\d{3})+  # one or more sets of three digits
    \b        # and then a word boundary
  )
` `xg`;

console.log(digitsThatNeedSeparators);  
/**/

const separate000s = (n, sep = '\u202f') =>
  String(n).replace(digitsThatNeedSeparators, '$&' + sep);

console.log(separate000s(1234567));
/**/
```

And a monstrously complex example: [Daring Fireball's URL RegExp](http://daringfireball.net/2010/07/improved_regex_for_matching_urls):

```js 
const xRE = require('js-xre');

const url = xRE `
  \b
  (?:
    [a-z][\w-]+:                        # URL protocol and colon
    (?:
      /{1,3}                              # 1-3 slashes
      |                                   # or
      [a-z0-9%]                           # single letter or digit or '%'
                                          # (trying not to match e.g. "URI::Escape")
    )
    |                                   # or
    www\d{0,3}[.]                       # "www.", "www1.", "www2." … "www999."
    |                                   # or
    [a-z0-9.\-]+[.][a-z]{2,4}/          # looks like domain name followed by a slash
  )
  (?:                                   # one or more:
    [^\s()<>]+                            # run of non-space, non-()<>
    |                                     # or
    \(([^\s()<>]+|(\([^\s()<>]+\)))*\)    # balanced parens, up to 2 levels
  )+
  (?:                                   # end with:
    \(([^\s()<>]+|(\([^\s()<>]+\)))*\)    # balanced parens, up to 2 levels
    |                                     # or
    [^\s\`!()\[\]{};:'".,<>?«»“”‘’]       # not a space or one of these punct chars
  )
` `xig`;

console.log(url); 
/**/

console.log('Please visit http://mackerron.com.'.replace(url, '<a href="$&">$&</a>'));  
/**/
```
    
### `mm` for massively multiline

Serious HTML wrangling should be done with XPath or similar, of course. But:

```js
const xRE = require('js-xre');

const html = `
  <p>A paragraph on one line.</p>
  <p>A paragraph which, by contrast,
  spans multiple lines.</p>
`;

const mPara  = xRE `<p\b.+?</p>` `mg`;
console.log(mPara);
/**/

console.log(html.match(mPara));
/**/

const mmPara = xRE `<p\b.+?</p>` `mmg`;  // note: mm
console.log(mmPara);
/**/

console.log(html.match(mmPara));
/**/
```

### `b` for backslashes

Since our syntax for extended regular expressions uses template strings, you can interpolate any `${value}` in there. The `b` flag causes all values to be automatically escaped, so that they're treated as literal text rather then metacharacters.

For example, say you're allowing users to type in something to find all matches:

```js
const xRE = require('js-xre');

const searchText = '12.6';  // this might come from an <input> field
const search = xRE `^${searchText}$` `bg`;

console.log(search);
/**/
```

The alternative (useful if you want to mix-and-match your escaping for any reason) is to use the `escape` method of the main function:

```js
const xRE = require('js-xre');

const searchText = '12.6';  // might come from an <input type="text" />
const anchorStart = true;   // might come from an <input type="checkbox" />
const anchorEnd = false;    // might come from an <input type="checkbox" />

const search = xRE `
  ${anchorStart ? '^' : ''}
  ${xRE.escape(searchText)}
  ${anchorEnd ? '$' : ''}
` `gx`;

console.log(search);
/**/
```

## Use as a regular function

`xRE` can also be called as a regular (non-tagged-template) function. This could be useful if you wanted to create an extended regular expression based on user input in a `<textarea>`, say.

For instance:

```javascript
// earlier: <script src="js-xre.js"></script>

const make = (tag) => document.body.appendChild(document.createElement(tag));
const source = make('textarea');
const flags = make('input');
const output = make('div');

source.oninput = flags.oninput = () =>
  output.innerHTML = xRE(source.value)(flags.value);
```



