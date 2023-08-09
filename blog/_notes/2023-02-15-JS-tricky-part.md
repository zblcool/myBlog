---
title: Do not use forEach with async-await. Use For loop instead
date: 2023-02-15
tags:
  - JavaScript
  - Notes
  - Front End
author: Ash
location: Runcorn, Brisbane  
---


# Array  
Those thing relates to array/ map / reduce etc.




## Do not use forEach with async-await. Use For loop instead

> Ash's quote. This is tricky when you want to do several MongoDB operation in the loop. Things may not going the way you want. In my case. I try to insert several new docs into the db and give them a new globalId. and made some change base on each doc.However, using forEach / map in my case. The different doc may have same globalID. since forEach loop is not actual waiting anything.


> **Use `for...of` instead of `forEach` in asynchronous code.**
{.is-success}



### The problem

`Array.prototype.forEach` is not designed for asynchronous code.  (It was not suitable for promises, and it is not suitable for async-await.)

For example, the following forEach loop might not do what it appears to do:

```js
const players = await this.getWinners();

// BAD
await players.forEach(async (player) => {
  await givePrizeToPlayer(player);
});

await sendEmailToAdmin('All prizes awarded');
```

What's wrong with it?

- The promises returned by the iterator function are not handled.  So if one of them throws an error, the error won't be caught.  (In Node 10, if no `unhandledrejection` listener has been registered, that will cause the process to crash!)
- Because `forEach` does not wait for each promise to resolve, all the prizes are awarded in parallel, not serial (one by one).
- So the loop actually finishes iterating before any of the prizes have finished being awarded!  (But after they have all started being awarded).
- As a result, `sendEmailToAdmin()` sends the email before any of the prizes have finished being awarded.  Maybe none of them will end up being awarded (they might all throw an error)!

### So how should we write this?

#### Process each player in serial

Fortunately if your language has async-await then it will also have the `for...of` construction, so you can use that.

```js
for (const player of players) {
  await givePrizeToPlayer(player);
}
```

This loop will wait for one prize to be awarded before proceeding to the next one.

You could also use a traditional `for(...;...;...)` here but that is more verbose than we need.

_Note:_ The airbnb style guide recommends _not_ using `for...of` for _web apps_ at the current time (2018), because it requires a large polyfill.  If you are working in the browser, use the traditional for mentioned above, or `Array.reduce()` described below.

#### Process all the players in parallel

If the order doesn't matter, it may be quicker to process all the players in parallel.

```js
await Promise.all(players.map(async (player) => {
  await givePrizeToPlayer(player);
}));
```

This will start awarding all the prizes at once, but it will wait for all of them to complete before proceeding to `sendEmailToAdmin()`.

#### Process each player in serial, using `Array.prototype.reduce`

Some people recommend this approach:

```js
await players.reduce(async (a, player) => {
  // Wait for the previous item to finish processing
  await a;
  // Process this item
  await givePrizeToPlayer(player);
}, Promise.resolve());
```

(We are using the accumulator `a` not as a total or a summary, but just as a way to pass the promise from the previous item's callback to the next item's callback, so that we can wait for the previous item to finish being processed.)

This has pretty much the same behaviour as the `for...of` above, but is slightly harder to read.

However it is recommended by the Airbnb style guide because it can reduce the browser bundle size.  `for...of` requires iterators, and some browsers require a polyfill for iterators, and that polyfill is quite large.  You can decide on the trade-off between bundle size and developer convenience.

### So which array functions can I use?

_TLDR:_ Only `map()`, `reduce()`, `flatMap()` and `reduceRight()` if used correctly

async-await works naturally with `for` loops and `while` loops, because they are written in the original function body.

But when you call out to another function, it can only work with async-await if it returns a promise, and if that promise is handled (awaited or `.then()`-ed).

That is why we can use `.reduce()` and `.map()` above, because in both cases we return a promise (or an array of promises) which we can await.  (In the reduce case, each invocation of the callback function waits for the previous promise to resolve, to ensure sequential processing.)

But most array functions will not give us a promise back, or allow a promise to be passed from one call to the next, so they cannot be used asynchronously.  So, for example, you can not use asynchronous code inside `array.some()` or `array.filter()`:

```js
// BAD
const playersWithGoodScores = await players.filter(async (player) => {
  const score = await calculateLatestScore(player);
  return score >= 100;
});
```

It might look like that should work but it won't, because `filter` was never designed with promises in mind.  When `filter` calls your callback function, it will get a `Promise` back, but instead of awaiting that promise, it will just see the promise as "truthy", and immediately accept the player, regardless of what their score will eventually be.

You may be able to find a library of array functions that can work asynchronously, but the standard array functions do not.


> Reference  https://gist.github.com/joeytwiddle/37d2085425c049629b80956d3c618971
{.is-info}