---
layout: post
title:  "Using helm-ag to search and replace in an Emacs project"
date:   2015-03-11 22:00:00
categories: posts emacs workflow
---
I've recently found this great little `Emacs` [`helm`](https://github.com/emacs-helm/helm) plug-in by
[syohex](https://github.com/syohex) called [`helm-ag`](https://github.com/syohex/emacs-helm-ag).
It provides a `helm` interface for searching with the, _silver searcher_, `ag`
command.

I think it's a gem! You type `M-x helm-ag` and start typing. It'll open up a
`helm` menu searching your files:
![searching demo](https://i.imgur.com/QZG62zk.gif)

You can then type `C-e` inside that buffer and switch to "edit" mode, where you
can edit the matches, pressing `C-c C-c` to save and `C-c C-k` to abort:
![editing demo](http://i.imgur.com/IV5eMib.gif)

I have it aliased to `,ag` and I think it's a very nice time saver.
