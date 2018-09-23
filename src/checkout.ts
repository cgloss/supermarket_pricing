/**
 * super market checkout code excercise
 *
 * assumptions:
 * - in the event of a combo purchase, the items are not sharable to other combos
 * - items purchased with promotion can not have more then one promotion applied
 * - apply the most cost effective promotion for the customer
 * - overlaping promotions are intentional/acceptable
 *
 */

// TODO: add clear cart method
// TODO: resolve compile issue, switch find to filter index of
// TODO: switch undefined to return empty default item
// TODO: switch undefined price return to 0
// TODO: finish test cases


/**
 * Interface for pricing scheme.
 *
 * @interface
 *
 */
export interface IPricingScheme {
  /** numeric auto inc id for each entry */
  _id: number;
  /** string describes supermarket pricing scheme category */
  category: string;
  /** string used to filter individual items and promotions from scheme */
  type: string;
  /** array housing one or more sku for individual items */
  items: string[];
  /** string describes the item or promotion */
  name: string;
  /** numeric float which is applied to cart total can be either positive or negative */
  price: number;
  /** optional numeric float can be applied to individual item as (1 * [tax]) - .0925 */
  tax?: number;
}

/**
 * Class for an individual custom checkout.
 * @constructor
 * @param {Object[]} pricingScheme - the pricing scheme containing items and promotions.
 */
export class Checkout {

  public cart: Array<IPricingScheme> = [];
  private _applicablePromotions: Array<IPricingScheme> = [];
  private _cacheTotal: number = 0;
  private _promotions: Array<IPricingScheme> = [];

  constructor(public pricingScheme: Array<IPricingScheme>) {

  }
  
  /** allow terminal to item/price check */
  itemCheck(sku: string | number): IPricingScheme | undefined{
    try {
      return this.pricingScheme.find(entry => entry.type === 'item' && entry.items.length === 1 && entry.items[0] === String(sku));
    } catch (err) {
      console.log('item not found');
      return undefined;
    }
  }

  /** returns price for terminal use to display as items are scanned */
  scan(sku: string | number): number | undefined{
    this._cacheTotal = 0;
    let item = this.itemCheck(sku);    
    if(!item){
      return undefined;
    }
    this.cart.push(item);
    // apply tax and add items price to subtotal
    this.findPromotions(sku);
    return (item.price * (1 + (item.tax || 0)));
  }

  /** allow terminal to look up item related promotions */
  findPromotions(sku: string | number): Array<IPricingScheme> {
    let promotions = this.pricingScheme.filter(entry => entry.type === 'promo' && entry.items.length >= 1 && entry.items.indexOf(String(sku)) !== -1);
    // concat filtered promotions relevant to this sku
    this._promotions = this._promotions.concat(promotions);
    return promotions;
  }

  /** allow terminal to get current scanned items */
  reviewCart(): Array<IPricingScheme> {
    return this.cart;
  }

  /**
   * filters and sorts promotions related to current cart items 
   * then validates that all conditions of the promotion are met 
   * adds to applicable promotions for use in final total 
   */
  private validatePromotions(): void {
    this._applicablePromotions = <IPricingScheme[]>[]; 
    // define array of cart sku's to ensure no erroneous duplication of shared partials in promotions
    let available = this.cart.map(entry => entry.items[0]);
    // sort promotions by cost savings in the event of duplicate/overlapping promos
    this._promotions.sort((a, b) => a.price - b.price);
    // for each found promotion try to apply, allowing it to fail when unmet
    for (let found of this._promotions) {
      // use set to verify met conditions are of unique indexes in cart
      let valid = new Set();
      for (let i = found.items.length - 1; i >= 0; i--) {
        // get index of condition item _id
        let index = available.indexOf(found.items[i]);
        // item exists in cart, increment count of conditions met
        if (index !== -1) {
          // mutate scoped cart arr but maintains index
          delete available[index];
          // add to valid indexes
          valid.add(index);
        }
      }
      // verify all nessesary conditions are met
      if (valid.size === found.items.length) {
        this._applicablePromotions.push(found);
      }
    } 
  }

  /** allow terminal to void item from cart */
  void(sku: string | number): void {
    this._cacheTotal = 0;
    let index = this.cart.findIndex(entry => entry.items[0] === String(sku));
    if(index !== -1){
      this.cart.splice(index, 1);
    }
  }

  /** allow terminal to get the promotions applied to the current cart */
  getAppliedPromotions(): Array<IPricingScheme>{
    return this._applicablePromotions;
  }

  /** return item price with applicable tax included */
  getSum(item:IPricingScheme): number {
    return (item.price * (1 + item.tax));
  }

  /** Returns the cart total with promotional reductions applied */
  getTotal(): number {
    if (!this._cacheTotal) {
      let total = this.cart.reduce((a, b) => a + this.getSum(b), 0);
      // apply promotions
      this.validatePromotions();
      let reduction = this._applicablePromotions.reduce((a, b) => a + b.price, 0);
      // assumption return in cents per document
      this._cacheTotal = Math.round((total+reduction)*100);
    }
    return this._cacheTotal;

  }
}