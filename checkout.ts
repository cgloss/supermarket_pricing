// making assumption in the event of a combo purchase, the items are not sharable to other combos
// making assumption that items purchased with promotion can not have more then one promotion applied
// making assumption to apply the most cost effective promotion for the customer
// making assumption that overlaping promotions are intentional or acceptable

export interface IPricingScheme {
  _id: number;
  category: string;
  type: string;
  items: string[];
  name: string;
  price: number;
  tax?: number;
}

export class Checkout {

  public cart: Array<string> = [];
  public total: number = 0;

  constructor(public pricingScheme: Array<IPricingScheme>) {

  }

  scan(sku: string): void {
    // if we were passing more then a single id use concat, push is more performant though mutates
    this.cart.push(sku);
  }

  getTotal(): number {
    // define scoped clone of cart to ensure no erroneous duplication of shared partials in promotions
    let available = this.cart.slice();
    // for each item in cart
    for (let i = this.cart.length - 1; i >= 0; i--) {

      try {
        // apply tax and add items price to subtotal
        let item = this.pricingScheme.find(entry => entry.type === 'item' && entry.items.length === 1 && entry.items[0] === this.cart[i]);
        this.total += (item.price * (1 + item.tax));
      } catch (err) {
        console.log('item code not found');
        continue;
      }

      // filter promotions to just those relevant to this cart item
      let promotions = this.pricingScheme.filter(entry => entry.type === 'promo' && entry.items.length >= 1 && entry.items.includes(this.cart[i]));
      // sort promotions by cost savings in the event of duplicate/overlapping promos
      promotions.sort((a, b) => a.price - b.price);

      // for each found promotion try to apply, allowing it to fail when unmet
      for (let found of promotions) {
        try {
          // use set to verify met conditions are of unique indexes in cart
          let valid = new Set();
          for (let j = found.items.length - 1; j >= 0; j--) {
            // scoped clone of current items promotion availability
            let arr = available.slice();
            // get index of condition item _id
            let index = arr.indexOf(found.items[j]);
            // item exists in cart, increment count of conditions met
            if (index !== -1) {
              // mutate scoped cart arr but maintains index
              delete arr[index];
              // add to valid indexes
              valid.add(index);
              // update available with clone
              available = arr.slice();
            }
          }
          // verify all nessesary conditions are met
          if (valid.size === found.items.length) {
            // log promotion with all conditions validated
            console.log(found);
            // apply promoti to total
            this.total += found.price;
          }
        } catch (err) {
          console.log('promotion not applicable');
        }
      }
    }
    // assumption return in cents per document
    return Math.round(this.total*100);
  }
}