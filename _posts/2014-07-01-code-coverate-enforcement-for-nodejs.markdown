---
layout: post
title:  "Code Coverage enforcement for Node.JS developers"
date:   2014-07-01 13:48:01
categories: posts nodejs tdd testing code-quality
---
> "TDD or not TDD, that is the question"

There's recently been a lot of talk about whether TDD (specifically relating to
the *test first* and *unit testing* approaches) is worthwhile. Though I see a
lot of value in that discussion, not writing automated tests for programs,
regardless of the underlying development process, represents a tradeoff that's
(way) too big to match it's downsides.

Since a lot of people disagree with me, I found a way (which is actually pretty
mainstream, I suppose) to enforce standards on code testing. In this post, I'll
try to walk through how to force your colleges to test their `node.js` code, by
using and enforcing code coverage metrics.

# What is Code Coverage?

According to [wikipedia](http://en.wikipedia.org/wiki/Code_coverage), code
coverage is:

> a measure used to describe the degree to which the source code of a program is
> tested by a particular test suite.

I tend to think that's a pretty accurate definition, even though it's really
generic. In `node.js`, code coverage will most likely be the relation between
all the lines in a program (or single file) and those which actually got
executed while running your test suite.

Here's some example output from running a
[`mocha`](http://github.com/visionmedia/mocha/)'s test suite with the `html-cov`
reporter, paired with the [`blanket`](https://github.com/alex-seville/blanket)
code coverage library:

![html-cov sample output](http://i.imgur.com/7gWCQrd.png)

*I copied this picture from [visionmedia](http://github.com/visionmedia/)'s
[mocha site](http://visionmedia.github.io/mocha/) BTW.*

You can see that it highlights the lines which didn't get executed after running
the test suite in red, while the rest of the program is left untouched. By doing
this, we can quickly see what parts of the program haven't been tested (not even
indirectly - by an unit test to another part). This may seem useless, but in a
language such as JS (in which almost anything is valid code), knowing something
has run in a testing environment is pretty reassuring in a lot of ways.

At the right of the image, side-by-side with each file name, the coverage
percentages are presented. If we looked at the top of this output, we could also
see the coverage of the program as a whole.

What I meant by enforcing code coverage is to make the test suite **fail** when
local or global coverage is below a certain threshold. Using a CI system, for
example, it'll be possible to see and enforce that a certain percentage of the
code is "tested" - I use quotes, since coverage doesn't guarantee that software
is well tested, but the lack of it does guarantee that it's not tested at all.

# Why?

I think it's pragmatism goes a long way when programming. I also think methods
and processes takes teams a lot further. By enforcing certain standards on your
code, the developers are shielded from a lot of mistakes, as is the code. No
longer should management be dumbfounded on where the developers are in terms of
code quality. The programmers themselves can establish processes and standards
which let them get organized autonomously. The same, I believe, has even clearer
benefits on Free-Software. Why have style guides, when you can just run a
program to lint contributions? Why review for introduced bugs when you can have
unit tests? Why ask for tests when you can make the test suite fail when they
don't meet a certain coverage threshold?

The reason I vouch for static code analysis and testing is because just as
code-bases grow and get more robust as they are battle tested, so can your
methods and strategies when handling it. What do I mean? The test suite and the
development process may, by using autonomous strategies, grow organically with
the code. The ease development should be directly (not inversely) proportional
to a system's sophistication. But honestly, the reason I add code coverage
enforcement to my projects is precisely because a lot of programmers think these
arguments (the last two paragraphs) are crazy talk.
 
# Set-up

So assume we have written a module which adds two numbers:
{% highlight javascript %}
// index.js
'use strict';
exports = module.exports = function add(x, y) {
  return x + y;
};
{% endhighlight %}

To publish on `npm` we'd also need a `package.json` file with something like:
{% highlight javascript %}
{
  "name": "add",
  "version": "0.0.1",
  "description": "Adds two numbers.",
  "main": "index.js"
}
{% endhighlight %}

If we run `npm install --save-dev blanket mocha`, we'll install what we need to
get started with basic coverage generation. Let's write a dummy test, like this:
{% highlight javascript %}
'use strict'; /* global describe, it */
var add = require('..');
var assert = require('assert');

describe('add', function() {
  it('dummy test', function() {
    assert(true, 'wat');
  });
});
{% endhighlight %}

Running our test with `mocha -R spec` (the `-R` flag tells mocha which test
reporter to use), we see everything is working and pretty (though useless):

![test runs fine](http://i.imgur.com/p1TYdE2.png)

Now we need to add a blanket configuration to the `package.json`. We do this by
adding a `"config"` node to the top-level, with the following contents:
{% highlight javascript %}
"config": {
  "blanket": {
    "data-cover-never": "node_modules",
    "pattern": "index.js"
  }
}
{% endhighlight %}

This tells blanket to generate coverage for files which match `"pattern"` and to
always ignore files which match `"data-cover-never"` (in real-life, you could
specify an array and/or use wildcards and regular expressions).

Now, if we run `mocha -R html-cov --require blanket > coverage.html` and open
the generated HTML output, we'll see the same kind of report I showed earlier:

![add coverage report](http://i.imgur.com/XwacfWf.png)

Everything looks good, but if we were to set-up a `npm test` script, it wouldn't
fail regardless of what percentage of code coverage we had.

# Enforcement

There wasn't a really pretty solution to code coverage enforcement, so I rolled
my own, extending the `spec` reporter, which I find most useful. I called it the
`spec-cov-alt` reporter (I only discovered a `spec-cov` reporter existed after I
was done). Its code is available on
[github](https://github.com/yamadapc/mocha-spec-cov-alt) and if you take a look
at the code you'll see that without much effort it be extending any mocha
reporter.

So let's install that with `npm install --save-dev mocha-spec-cov-alt` and run
our tests with `mocha -R mocha-spec-cov-alt --require blanket`:

![test add coverage](http://i.imgur.com/CBdqRJZ.png)

And that's it: tests now fail, since global coverage is below the default
threshold of 80%. The
[documentation](https://github.com/yamadapc/mocha-spec-cov-alt) specifies how to
customize the global and local thresholds, as well as output `lcov` data for
[coveralls](https://coveralls.io/) or [codeclimate](https://codeclimate.com/).

If we add a test to our add function:
{% highlight javascript %}
'use strict'; /* global describe, it */
var add = require('..');
var assert = require('assert');

describe('add', function() {
  it('adds two numbers together', function() {
    var ret = add(1, 2);
    assert(ret === 3, 'Addition works');
  });
});
{% endhighlight %}

And run the command again, we'll get:

![coverage success](http://i.imgur.com/kyuX2ts.png)

This is how I like to set-up code coverage for Node.JS applications. I know it
doesn't cover everything, but I think it gives a general overview of how to do
it.

If you have better ideas, I'd love to discuss this on twitter
([@yamadapc](https://twitter.com/yamadapc)) and I'm trying things on github
([@yamadapc](github.com/yamadapc)).
