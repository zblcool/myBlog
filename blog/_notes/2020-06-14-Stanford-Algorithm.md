---
title: Divide and Conquer 
date: 2020-06-14
tags:
  - Algorithms
  - Notes
author: Ash
location: Sydney  
---


## 1. Intro
- Why Study Algorithms
    - technology innovation
    - provides the lens outside the computer science
- Integer multiplication
  - product X,Y . 
  > product means output
- Karatsuba multiplication
  - recursive
  > call you self 
  - base case   
  > basic situation of something
  - refine
  > optimise

## 2. Sorting

- ### buble
  - compare every item with its neighbour A & B
  - if A is bigger then switch two items's position
  - do the loop from the first item to last item so there will be n item
  - the first item do n-1 times, last item do 0 times
  - (n-1 + 0)* n / 2 times overall 
  - so the time complexity is O(n^2)


- ### selection 
  > "finding the smallest one first. 
  but we can also find the biggest one instead "
  - Loop (n-1) times // O(N)
    - set the first one as the SMALLEST one 
    - loop and compare every one if they are smaller than the SMALLEST one // O (N)
      - if some one did then set its value to the new SMALLEST
    - change their position ( new Smallest and the SMALLEST we set before the loop) // O(1)
  - Still O(n^2)


- ### InsertSort
  > "insert the unordered items into the ordered sequence like a poker"
  - Loop( i =1 i< array.length i++)
    - if (array[i] < array[i-1]) {
      "Start from left, go to right. when right is bigger than left , start the follow loop"
      - int temp  = array[i] 
        "to store the one we are working on. But we don't change others only focus on this one (who become the temp)"
      - int j = i
        "we want to operate it so we create a new agent "j""
      - while ( j>0 && temp< array[j-1]){
        "we are actually pull out the temp(array[i]) out and operates others "
        - array[j] = array[j-1]
          "just let the left item become the right one. and leave temp. temp is still temp(don't change temp now . So this will just work on everyone to change their number equals to left one )"
        - j-- 
          > "https://pic3.zhimg.com/v2-91b76e8e4dab9b0cad9a017d7dd431e2_b.webp"
      - array[j] = temp
  - Overall: O(N) in best case ( good order) and O(N*N)=O(N^2) in bad case


- ### Merge Sort
  - things to do 
    - divide into two part
    - recursive each 
    - combine
  - How to combine 
    - C = output [length = n]
    - A = 1st sorted array [n/2]
    - B = 2nd sorted array [n/2]
    - i=1 j=1
    - for k = 1 to n
      - if A(i)<B(j)
        - C(k) = A(i)
        - i++
      - else B(j)<A(i)
        - C(k) = B(j)
        - j++
    - end
  - Running Time
    - 
