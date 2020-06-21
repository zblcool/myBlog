---
title: Algorithms Notes
date: 2020-04-20
tags:
  - Algorithms
  - Notes
  - Computer Science
author: Ash
location: Sydney  
---


# Algorithms Notes

- [Algorithms Notes](#algorithms-notes)
  - [Quick-Find](#quick-find)
  - [Quick-Union](#quick-union)
    - [DATA Structure](#data-structure)
    - [Find way](#find-way)
    - [Union](#union)
    - [Problems](#problems)
    - [Improvement](#improvement)

## Quick-Find

- easy to think but not efficient

## Quick-Union

  > "still easy but cost too much"

### DATA Structure

- in the id[ i ]  array, each number have a roots if they are union with another one . So the number it stores is the number of id[ i ] , Which indicates the root of it. Keep finding ,and you will find the real root.

### Find way

- check if  p and q have the same root

### Union

- To merge components containing p and q . Set the id of p's root to the id of  q's root
- Dont have to connect one with another one . Just connect with its root. Because when you want to check if they are connected . Only check their roots

### Problems

- The tree might be really tall . So each time you need to do ROOT() function too many times.

### Improvement

- Weighted quick-union
  - Weighting the tree . There is gonna be two kinds of tree . longer tree and smaller tree .Make sure connect the smaller tree's root to the longer one's
  - But how to know which tree is longer? how to mark this
    - add another array named size[ ]  put the depth of root in it.
    - compare the depth while merging the trees.
