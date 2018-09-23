# TypeScript Solution for Supermarket Pricing Exercise
*see exercise documentation below*

Solution resides [/src/checkout.ts](/src/checkout.ts)

Example Scheme [/src/checkout.ts](/src/scheme.ts)

On start 
```
const c = new Checkout(todaysScheme);
  c.scan('1983'); // toothbrush
  c.scan('4900'); // salsa
  c.scan('8873'); // milk
  c.scan('6732'); // chips
  c.scan('0923'); // wine
  c.scan('1983'); // toothbrush
  c.scan('1983'); // toothbrush
  c.scan('1983'); // toothbrush

let cents = c.getTotal();
console.log(cents);
```
is executed.


# Getting Started
*requires npm, docker w/ compose*
```
docker-compose-up
```
## Running tests
```
npm run test
```
## Credits
[@cgloss](https://github.com/cgloss)

# Exercise Documentation

Supermarket Pricing Coding Exercise
===================================

Problem Description
-------------------

Your team is starting a new project with Super Food, a chain of supermarkets across the country. Create a program for Super Food's point of sale system that uses their pricing scheme to calculate the total price for a number of items. Your code will become the core of a point of sale system, so make sure it represents your best code.

Remember: We're evaluating your design and development skills based on the code you give us. Make sure it reflects the type of code you'd write on a production software system for us. Take your time. Remember to refactor and write unit tests. If these instructions are unclear, rather than ask for clarification, list your assumptions and work from them.


Each item at Super Foods is identified by a unique four-digit code. Today, pricing schemes at Super Foods use the following pricing categories, but beware: prices are constantly changing, and the sales department is always creating new incentives and deals.

# Example Pricing Scheme

- Simple: A carton of milk (item #8873) costs $2.49
- Buy X, Get Y Free: Buy two toothbrushes (item #1983) for $1.99 each, get one free
- Additional Taxes: A bottle of wine (item #0923) costs $15.49 and is taxed an additional 9.25%
- Bundled: Chips and salsa (items #6732 and #4900) cost $4.99 together, but they cost $2.49 and $3.49 alone, respectively.


Example
-------

You can use any language you'd like, but the interface to your program should look like:
```
Checkout c = new Checkout(todaysScheme);
c.scan("1983"); // toothbrush
c.scan("4900"); // salsa
c.scan("8873"); // milk
c.scan("6732"); // chips
c.scan("0923"); // wine
c.scan("1983"); // toothbrush
c.scan("1983"); // toothbrush
c.scan("1983"); // toothbrush
int cents = c.getTotal();
assert 3037 == cents
```