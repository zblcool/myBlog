---
title: Machine learning
date: 2020-03-10
tags:
  - Machine Learning
  - Notes
author: Ash
location: Sydney  
---


# 1. Machine learning

- [1. Machine learning](#1-machine-learning)
  - [1.1. Chapter](#11-chapter)
    - [1.1.1. Weight](#111-weight)
    - [1.1.2. Bias](#112-bias)
    - [1.1.3. Cost](#113-cost)
  - [1.2. Gradient](#12-gradient)
    - [1.2.1. minimum of a f(x)](#121-minimum-of-a-fx)
    - [1.2.2. Gradeint](#122-gradeint)
    - [1.2.3. michele nilsen neural networks website](#123-michele-nilsen-neural-networks-website)
    - [1.2.4. paper](#124-paper)
    - [1.2.5. aim is to reduce the cost function](#125-aim-is-to-reduce-the-cost-function)
  - [1.3. Backpropagation](#13-backpropagation)
  - [1.4. MNIST DATABASE Training materials](#14-mnist-database-training-materials)

## 1.1. Chapter

- different level have diff orintaion
- split the character and number into many components .

Base on databases wich have thounsansds of number and graph match which teach them .

### 1.1.1. Weight

### 1.1.2. Bias

### 1.1.3. Cost

How good is a network

## 1.2. Gradient

### 1.2.1. minimum of a f(x)

- local minumusm
  - caculter the 斜率  to the lower place . test again till the gradient become 0
  - doable
- Global minimum
  - drop several of balls to firgure out the minumum and compare them.
  - crazy hard

### 1.2.2. Gradeint  

 > "This solve my consider about how to find out the good weight"

- the direction to deep
  - Compute $\nabla$C  add a negative before it -$\nabla$C small step add repeat
    > "this is what need to add and reduce every times"
  - like W0 should increase 0.1 W2should decrese 0.2

### 1.2.3. michele nilsen neural networks website

### 1.2.4. paper

- understanding deep learning requires re-thinking generalization
- A closer lokk at memorization in deep networks

### 1.2.5. aim is to reduce the cost function

- use -$\nabla$C(weithts and biases) to reduce  C()
- The methods mentioned above is an old way of doing this

## 1.3. Backpropagation

## 1.4. MNIST DATABASE Training materials
