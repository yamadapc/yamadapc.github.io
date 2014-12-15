---
layout: post
title:  "Relative tmux pane resizes - scripted with D"
date:   2014-12-15 07:23:01
categories: posts tmux workflow
---
A couple of weekends back I was doing things on the terminal, having to
multi-task, because some fairly repetitive boring tasks (like deploying Haskell
to Heroku - in spite of the wonderful [heroku-buildpack-ghc](https://github.com/begriffs/heroku-buildpack-ghc)
and [haskell-on-heroku](https://github.com/mietek/haskell-on-heroku) projects).
While I waited for things to happen, I wanted to do other things and I stumbled
on a little thing which I wanted in **`tmux`**. Relative pane resizes.

**`tmux`** supports resizing panes to a number, as well as resizing them evenly,
vertically or horizontally - something I've [aliased to easy to reach keys](https://github.com/yamadapc/dotfiles/blob/81f7b2f0bb8a98695cf1d4ad994a41e0d8cd89b2/tmux.conf#L77-L78)
and use a lot. But there's no obvious way to resize them relatively though (say
make this pane be 20% of the available vertical space), so while my heroku
deployment ran slowly, I wrote a tiny script to do that.

The code is open-source and available on GitHub, so if you're looking for a
quick and dirty solution you can visit it [here](https://github.com/yamadapc/tmux-pane-rel)
and build it. I think it stands as a fine example of how D can be used as a
scripting language, even though that's not it's main _"porpoise"_.

First, we need to import a couple of things:
{% highlight d %}
import std.conv : to;         // for type conversions
import std.getopt : getopt;   // for command-line option parsing
import std.process : execute; // for system command execution
import std.stdio : writeln;   // for printing stuff
import std.string : split;    // for splitting strings
{% endhighlight %}

We should start by defining our command-line interface:
{% highlight d %}
static immutable string usage = "Usage: tmux-pane-rel [options] <percentage>"
{% endhighlight %}

This simply defines out usage string, the axis percentage to resize to will be
represented with an `axis` enum:
{% highlight d %}
enum axis { x, y }
{% endhighlight %}

We can now use axis values with `axis.x` and `axis.y` in a fast and type-safe
manner.

The main function is very simple. It starts with a familiar declaration.
{% highlight d %}
int main(string[] args) {
{% endhighlight %}

Here we use `int main` and make it receive `string[] args`, but we could just as
well had defined it with `void main` or with no arguments would still work as
expected.

We parse command-line options and delegate to a different function
`resizeTmuxPane`, where we'll call the appropriate tmux commands.

{% highlight d %}
bool help;
axis ax;

getopt(
  args,
  "axis|a", &ax,
  "help|h", &help
);

if(help || args.length < 2) {
  writeln(usage);
  return 1;
}

resizeTmuxPane(ax, args[args.length -1].to!int);
return 0;
{% endhighlight %}

Because of the awesome templating features in D, the interface to `getopt` is
very clean. It will automatically - though the types of its arguments now that
when we read `--axis=x` we want `ax` to be set to `axis.x` and which of the
options have required parameters, or no parameters at all.

In `resizeTmuxPane`, the idea is to turn the percentage into a pane size (given
functions that fetch our terminal size for us) and call `tmux resize-pane -x/y <size>`.
{% highlight d %}
void resizeTmuxPane(axis ax, int percentage) {
  auto wid = ax == axis.x ? getTerminalWidth() : getTerminalHeight();
  auto absValue = ((percentage.to!float / 100) * wid.to!float).to!int;
  execute([
    "tmux",
    "resize-pane",
    "-" ~ ax.to!string,
    absValue.to!string
  ]);
}
{% endhighlight %}

You can see that it takes and axis and a percentage and executes tmux command
with the `execute` function. It uses `getTerminalWidth` and `getTerminalHeight`
functions I'll discuss in a moment. Other things to point out are the use of the
`~` operator, for string concatenation and the use of the `.to` function, for
safe type conversions. Notice that though `to` is a function we imported from
`std.conv`, it's used postfix, as if it was a method and there's also a weird
`!` instead of familiar parentheses.

These are two different elements of D syntax. The first is
["Uniform Function Call Syntax"](http://www.drdobbs.com/cpp/uniform-function-call-syntax/232700394).
When the compiler sees `x.fn(a)`, it first looks for a method `fn` on `x` (if
`x` is a data type that has methods) and then looks for a function which matches
the signature `(return type) fn(typeof(x), typeof(a))`. The second is D's syntax
for template parameters. Essentially, if a function takes compile time
parameters, you call it with `fn!(compile time parameters...)(run time parameters...)`.
And if there's only one compile time parameter, the parentheses may be omitted
as in our example.

The function to get the tmux session total height is also very simple and shows
how the "Uniform Function Call Syntax" allows for expressing programs in a
_"pipeline"_ style:
{% highlight d %}
int getTerminalHeight() {
  return execute(["tmux", "list-windows", "-F", "#{session_height}"])
    .output
    .split("\n")[0]
    .to!int;
}
{% endhighlight %}

A couple of things are happening here. First, we're accessing a named field
`output` in `execute`'s return value. From the `std.process` documentation, the
return type of `execute` is `std.typecons.Tuple!(int, "status", string, "output")`.
This is a named tuple type defined at the meta-programming level. So `output`
here is just a `string`. We then read an integer from the first line of the
command's output.

The `getTerminalWidth` function is analogous and doesn't need to be included
here.
