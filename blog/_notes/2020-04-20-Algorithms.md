---
title: Algorithms Notes
date: 2020-04-20
tags:
  - Algorithms
  - Notes
author: Ash
location: Sydney  
---


# 1. Algorithms Notes

- [1. Algorithms Notes](#1-algorithms-notes)
  - [1.1. Quick-Find](#11-quick-find)
  - [1.2. Quick-Union](#12-quick-union)
    - [1.2.1. DATA Structure](#121-data-structure)
    - [1.2.2. Find way](#122-find-way)
    - [1.2.3. Union](#123-union)
    - [1.2.4. Problems](#124-problems)
    - [1.2.5. Improvement](#125-improvement)

## 1.1. Quick-Find

- easy to think but not efficient

## 1.2. Quick-Union

  > "still easy but cost too much"

### 1.2.1. DATA Structure

- in the id[ i ]  array, each number have a roots if they are union with another one . So the number it stores is the number of id[ i ] , Which indicates the root of it. Keep finding ,and you will find the real root.

### 1.2.2. Find way

- check if  p and q have the same root

### 1.2.3. Union

- To merge components containing p and q . Set the id of p's root to the id of  q's root
- Dont have to connect one with another one . Just connect with its root. Because when you want to check if they are connected . Only check their roots

### 1.2.4. Problems

- The tree might be really tall . So each time you need to do ROOT() function too many times.

### 1.2.5. Improvement

- Weighted quick-union
  - Weighting the tree . There is gonna be two kinds of tree . longer tree and smaller tree .Make sure connect the smaller tree's root to the longer one's
  - But how to know which tree is longer? how to mark this
    - add another array named size[ ]  put the depth of root in it.
    - compare the depth while merging the trees.
