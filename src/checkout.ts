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

// TODO: resolve compile issue, switch find to filter index of
// TODO: finish test cases

/**
 * Interface for pricing scheme.
 *
 * @interface
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
 * Interface for itemized cart with quantity
 *
 * @interface
 */
export interface IItemized {
  /** index signature for item sku */
  [key: string]: {
    /** number quantity of item in cart */
    count: number, 
    /** pricing scheme item object entry */
    item:IPricingScheme
  },
}

/**
 * Interface for point of sale cart review and push for upsell
 *
 * @interface
 */
export interface ICartReview {
  /** string used to filter individual items and promotions from scheme */
  scannedItems: IItemized;
  /** promo entries currently applied to cart (void aware)*/
  promotionsApplied: Array<IPricingScheme>;
  /** 
   * promo entries with partial matches to cart items to allow point of sale upsell attempt. 
   * (void un-aware): by design promotions upsell will not respond to individual voids of items,  
   * assumption that voids are either a duplicate or buyers remorse, 
   * the later being a use case for this upsell
   */
  promotionsUpsell: Set<IPricingScheme>;
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
  itemCheck(sku: string | number): IPricingScheme {
    try {
      return this.pricingScheme.find(entry => entry.type === 'item' && entry.items.length === 1 && entry.items[0] === String(sku)) || <IPricingScheme>{};
    } catch (err) {
      console.log('item not found');
      return <IPricingScheme>{};
    }
  }

  /** returns price for terminal use to display as items are scanned */
  scan(sku: string | number): number {
    this._cacheTotal = 0;
    let entry = this.itemCheck(sku) || <IPricingScheme>{};    
    // check it item is empty and if it is return it immediatly with defualt 0 price
    if(!entry.items){
      return 0;
    }
    this.cart.push(entry);
    // apply tax and add items price to subtotal
    this.findPromotions(sku);
    return this.getSum(entry);
  }

  /** allow terminal to look up item related promotions */
  findPromotions(sku: string | number): Array<IPricingScheme> {
    let promotions = this.pricingScheme.filter(entry => entry.type === 'promo' && entry.items.length >= 1 && entry.items.indexOf(String(sku)) !== -1);
    // concat filtered promotions relevant to this sku
    this._promotions = this._promotions.concat(promotions);
    return promotions;
  }

  /** get itemized list with count */
  getItemized(): IItemized {
    let itemized: IItemized = {};
    this.cart.filter(entry =>  
      itemized[entry.items[0]] = {count:(itemized[entry.items[0]] ? itemized[entry.items[0]].count : 0) + 1, item:entry}
    );
    return itemized;
  }  

  /** allow terminal to get current scanned items with quantity and promotions applied as well as possible promotions for upsell */
  reviewCart(): ICartReview {
    this.validatePromotions();
    let review: ICartReview = {
      scannedItems: this.getItemized(),
      promotionsApplied: this.getAppliedPromotions(),
      promotionsUpsell: this.getUpsellPromotions(),
    }
    return review;
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

  /** allow terminal to void entire cart */
  voidCart(): void {
    this.cart = <IPricingScheme[]>[];
    this._applicablePromotions = <IPricingScheme[]>[];
    this._promotions = <IPricingScheme[]>[];
    this._cacheTotal = 0;
  }

  /** allow terminal to get the promotions applied to the current cart */
  getAppliedPromotions(): Array<IPricingScheme>{
    return this._applicablePromotions;
  }

  /** allow terminal to get possible upsell promotions sans those already applied */
  getUpsellPromotions(): Set<IPricingScheme>{
    let upsell = new Set<IPricingScheme>();
    this._promotions.filter(entry => 
      this._applicablePromotions.indexOf(entry) === -1 && 
      upsell.add(entry)
    );
    return upsell;
  }

  /** return item price with applicable tax included */
  getSum(entry:IPricingScheme): number {
    return (entry.price * (1 + (entry.tax || 0)));
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