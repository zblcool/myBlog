---
title: Machine learning
date: 2020-03-10
tags:
  - Machine Learning
  - Notes
author: Ash
location: Sydney  
---


# Machine learning

- [Machine learning](#machine-learning)
  - [Chapter](#chapter)
    - [Weight](#weight)
    - [Bias](#bias)
    - [Cost](#cost)
  - [Gradient](#gradient)
    - [minimum of a f(x)](#minimum-of-a-fx)
    - [Gradeint](#gradeint)
    - [michele nilsen neural networks website](#michele-nilsen-neural-networks-website)
    - [paper](#paper)
    - [aim is to reduce the cost function](#aim-is-to-reduce-the-cost-function)
  - [Backpropagation](#backpropagation)
  - [MNIST DATABASE Training materials](#mnist-database-training-materials)

## Chapter

- different level have diff orintaion
- split the character and number into many components .

Base on databases wich have thounsansds of number and graph match which teach them .

### Weight

### Bias

### Cost

How good is a network

## Gradient

### minimum of a f(x)

- local minumusm
  - caculter the 斜率  to the lower place . test again till the gradient become 0
  - doable
- Global minimum
  - drop several of balls to firgure out the minumum and compare them.
  - crazy hard

### Gradeint  

 > "This solve my consider about how to find out the good weight"

- the direction to deep
  - Compute $\nabla$C  add a negative before it -$\nabla$C small step add repeat
    > "this is what need to add and reduce every times"
  - like W0 should increase 0.1 W2should decrese 0.2

### michele nilsen neural networks website

### paper

- understanding deep learning requires re-thinking generalization
- A closer lokk at memorization in deep networks

### aim is to reduce the cost function

- use -$\nabla$C(weithts and biases) to reduce  C()
- The methods mentioned above is an old way of doing this

## Backpropagation

## MNIST DATABASE Training materials
