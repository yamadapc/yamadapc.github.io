---
layout: post
title:  "How I manage Emacs daemons"
date:   2015-03-11 21:09:00
categories: posts emacs workflow
---
Sometimes `Emacs` takes 13 seconds to load. If you're me, it always does. That's
solvable using the `emacs --daemon` command. You run `emacs --daemon` to start
an emacs server and then use the `emacsclient` command to connect to the server
almost instantly (`emacsclient -t` opens a new frame on the current terminal).

The problem is sometimes `Emacs` crashes. It doesn't crash everyday, nor does it
crash every week, but, sometimes, it does. And sometimes `Emacs` crashes when
you're working on several large projects and have tons of buffers open. If
you're using `emacs --daemon`, suddenly all your projects crash.

To fix this problem, I wrote a simple script called `projectroot`. It's a ~60
lines C script, available [here](https://gitlab.com/yamadapc/projectroot). What
it does, using a similar logic to the `projectile` `Emacs` plug-in, is to find
the root of the project you're currently on and echo it back to `stdout`.

You can use it to write simple useful aliases. On my `.profile` file, I have `e`
aliased to `emacsclient -t` and `v` aliased to `mvim -v`. So I added a couple of
functions to my `.zshrc` file:

{% highlight bash %}
function ep {
    emacsclient -t -s $(basename $(projectroot)) $@
}

function ep-start {
    emacs --daemon=$(basename $(projectroot)) $@
}

function ep-stop {
    emacsclient -t -s $(basename $(projectroot)) -e '(save-buffers-kill-emacs)'
}
{% endhighlight %}

`ep-start` will launch an `Emacs` daemon with the current project's root
basename as it's name. So if you're inside of `~/somewhere/some-project/test`
it'll be called `some-project`. `emacsclient` provides us with a `-s` flag,
which let's us connect to a named `Emacs` daemon.

In a similar fashion, `ep` will connect to the server corresponding to the
current project. Because I'm using `$@` inside of the function, I can run `ep <file1> <file2> ...`
just as I would run `emacsclient -s some-project` without the shortcut.

Running `ep-stop` inside of a project will terminate its server saving all the
buffers.

I also wrote a small bash script to list running `Emacs` servers, I called it
`emacs-servers` and put it on my `$PATH`:

{% highlight bash %}
#!/usr/bin/env bash
function main {
  local serverdir="${TMPDIR:-/tmp}/emacs${UID}"
  local -a servers
  for file in ${serverdir}/*; do
    if [[ -S ${file} ]]; then
      servers+=("${file##*/}")  
    fi
  done

  echo "${servers[@]}"
}

main
{% endhighlight %}

(it has some other weird output that's an unknown to me - ping me on
[twitter](https://twitter.com/yamadapc) if you know what it is).

I think this is an improvement over running a single emacs server or manually
naming servers. I already use `tmux` for managing my terminal sessions by work,
open-source etc. so keeping something that's encoded on the directory structure
on my mind seemed silly, but I'd love to know what other people think of this.
I've posted this on reddit, so there's a reddit thread [here](https://www.reddit.com/r/emacs/comments/2yqpex/how_i_manage_emacs_daemons/)
I'll be likely watching.

My dotfiles are available at [https://github.com/yamadapc/dotfiles](https://github.com/yamadapc/dotfiles).
