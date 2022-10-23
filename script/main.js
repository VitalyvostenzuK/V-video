'use strict';

const btnEl = document.querySelector('.btn-card');
const bsketEls = document.querySelector('.basket-products');
  
  
  const API_URL = 'https://raw.githubusercontent.com/GeekBrainsTutorial/online-store-api/master/responses';
  
class List {
  constructor(container, url, list = list2) {
    this.container = container;
    this.url = url;    
    this.list = list;
    this.goods = [];
    this.allProducts = [];
    this.filterGoods = [];
    this._init();
  }

  getJson(url) {
  return  fetch(url ? url : `${API_URL + this.url}`)
      // return fetch(`${API_URL + this.url}`)
            .then(text => text.json())
  }

  handleItem(item) {
    this.goods = item;
    this.createMarkup();
    
  }

  createMarkup() {
    console.log(this.constructor.name)
    const block = document.querySelector(this.container);
    for (let product of this.goods) {
      const productObj = new this.list[this.constructor.name](product);
      this.allProducts.push(productObj);
      block.insertAdjacentHTML('beforeend', productObj.render());
    }
   } 
 }


class ProductsList extends List {
  constructor(cart, container = '.goods-list', url = '/catalogData.json') {
    super(container, url) 
    this.cart = cart;
    this.getJson()
      .then(item => this.handleItem(item))
  }

  _init() {
    document.querySelector(this.container).addEventListener('click', e => {
      if(e.target.classList.contains('btn-add')) {
        console.log(e.target);
        this.cart.addProduct(e.target);
      }
    });
   
    document.querySelector('.form-head').addEventListener('submit', e => {
      e.preventDefault();
      this.productMatch(document.querySelector('.search-input').value);
    });  
  }

  productMatch(value) {
    let rexEx = new RegExp(value, 'i');
    this.filterGoods = this.allProducts.filter(product => rexEx.test(product.title));
    this.allProducts.forEach(el => {
      let product = document.querySelector(`.goods-item[data-id="${el.id}"]`);
      if (!this.filterGoods.includes(el)) {
        product.style.display = 'none';
      } else {
        product.style.removeProperty('display');
      }
    })
  }

  // productMatch(value) {
  //   let rexEx = new RegExp(value, 'i');
  //   this.filterGoods = this.allProducts.filter(product => rexEx.test(product.title));
  //   this.allProducts.forEach(el => {
  //     let product = document.querySelector(`.goods-item[data-id="${el.id}"]`);
  //     if (!this.filterGoods.includes(el)) {
  //       product.style.display = 'none';
  //     } else {
  //       product.style.removeProperty('display');
  //     }
  //   });
  // }
}

class Item {
  constructor(el, img = `src="image/iMac.jpeg"`) {
    this.title = el.product_name;
    this.price = el.price;
    this.id = el.id_product;
    this.img = img;
  }
  render() {
     return `<div class="goods-item" data-id="${this.id}">
                 <img class="img-goods" ${this.img} alt="iMac">
              <div class="wrap-price"> 
                   <h3 class="product-name">${this.title}</h3>
                   <p class="product-price">${this.price}$</p>
                   <button class="btn-add" type="button" 
                      data-id ="${this.id}" 
                      data-name ="${this.title}" 
                      data-price ="${this.price}">Купить
                   </button>
              </div>
            </div>`
  }
}

class ProductItem extends Item {}

class CartItem extends Item {
  constructor(el) {
    super(el)
    this.quantity = el.quantity;
  }

  render() {
    return `<div class="merch-item" data-id="${this.id}">
              <img class="merch-product" ${this.img} alt="iMac">        
                <div class="merch-price">
                    <h4 class="merch-name">${this.title}</h4>
                    <p class="merch-quantity">Quantity: <span class="merch-span">${this.quantity}</span></p>
                    <p class="price-per-piece">$${this.price} 
                    <span>each</span></p>
                </div>
    <div class="merch-right-block">
      <p class="basket-price-product">$<span class="bskt-price-span">${this.price}<span></p>
      <div class="wrap-del-btn"><button class="del-btn" data-id="${this.id}">x</button></div>
    </div>
  </div>`
  }
}

class Cart extends List {
  constructor(container = '.basket-products', url = '/getBasket.json') {
    super(container, url)
    this.getJson() 
      .then(item => this.handleItem(item.contents));
  }

  _init() {
    btnEl.addEventListener('click', () => {bsketEls.classList.toggle('none')});
    document.querySelector(this.container).addEventListener('click', e => {
      if(e.target.closest('.del-btn')) {
        this.removeProduct(e.target);
      }
    })
  }

  addProduct(elem) {
    this.getJson(`${API_URL}/addToBasket.json`)
          .then(item => { 
            if(item.result === 1) {
              const productId = +elem.dataset.id;
              if(find) {
                find.quantity++;
                this._changeMarkup(find);
              } else { 
                let product = {
                  id_product: productId,
                  product_name: elem.dataset.name,
                  price: +elem.dataset.price,
                  quantity: 1
                }
                this.goods = [product];
                this.createMarkup(); 
              }
            }
          })
  }

  removeProduct(elem) {
    this.getJson(`${API_URL}/deleteFromBasket.json`)
          .then(item => {
            if(item.result === 1) {
              const productId = +elem.dataset.id;
              const find = this.allProducts.find(product => product.id === productId);
              if(find.quantity > 1) {
                find.quantity--; 
                this._changeMarkup(find);
              } else { 
                this.allProducts.splice(this.allProducts.indexOf(find), 1);
                document.querySelector(`.merch-item[data-id="${productId}"]`).remove();
              }
            }
          })
  }

   _changeMarkup(product) {
    const block =  document.querySelector(`.merch-item[data-id="${product.id}"]`);
    block.querySelector('.bskt-price-span').textContent = product.quantity * product.price;
    block.querySelector('.merch-span').textContent = product.quantity;
  } 
}

const list2 = {
  ProductsList: ProductItem, 
  Cart: CartItem,
}

const cart = new Cart();
const products = new ProductsList(cart);

