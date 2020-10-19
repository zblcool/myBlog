---
title: Clean Code
date: 2020-08-8
tags:
  - Clean Code
  - Computer Science
author: Ash
location: Sydney  
---

# 1. Name 
## 1.1. meaningful 
## 1.2. avoid disinformation
## 1.3. pronouncable and searchable
    - use the character like "e" only in local variable. 
    - e is also the most common char in English word. so avoid searching it
## 1.4. some old ways we have already abandanded
    - HN : Hungraian Notion 
      - "phoneString phoneNumber"
      - was just use to remember in the age when there is no type check in compilers
    - member prefixs
      - m_ prefixes is nolonger need 
## 1.5. Avoid Mental Mapping
    Some times people like to use abstract loop and mapping by a single letter x or n or any other. 

    Then it would be very simple in the loop but is hard for others to read.

    Some smart programmers wants to show off that they can use mental mapping, But this is not decent in the team work.

> One difference between a smart programmer and a professional programmer is that the professional understands that clarity is king. Professionals use their powers for good and write code that others can understand.
> 
> -- Page 25 《Clean Code》

## 1.6. Class name
    Use Noun and Noun Phrase
    
    Avoid using "Manager,Processor,Data,Info"

*Should NOT be a verb*

## 1.7. Method Name 
    Use Verb and Verb Phrase

    Add get/set/is if necessary

## 1.8. Context 
    Add meaningful context instead of not necessary context


#