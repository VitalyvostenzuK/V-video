'use strict';

const btnEl = document.querySelector('.btn-card');
  const bsketEls = document.querySelector('.basket-products');
  
  
  const API_URL = 'https://raw.githubusercontent.com/GeekBrainsTutorial/online-store-api/master/responses';
  
  // Базовый класс для всех списков - то есть базовый для каталога и корзины.
class List {
  /** 
   * @param {container} - в данный блок выведим товары либо каталога, либо корзины.
   * @param {url} - путь к json файлу, из которого будем барть товары. 
   * @param {list} - для возможности вывода и товаров каталога и товаров корзины. 
   */

  constructor(container, url, list = list2) {
    this.container = container;
    this.url = url;    
    this.list = list;
    this.goods = []; // товары для json.
    this.allProducts = []; // массив объектов соответствующего класса.
    this.filterGoods = [];
    this._init(); // данный метод только отвечает за события на сайте
  }

  getJson(url) {
  return  fetch(url ? url : `${API_URL + this.url}`)
      // return fetch(`${API_URL + this.url}`)
            .then(text => text.json())
  }

  handleItem(item) { // запускает отрисовку либо каталога товара, либо товаров корзины.
    this.goods = item; // после того как массив заполнен товарами можно  ...
    this.createMarkup();// ... их отрисовывать и выводить на экран.
    
  }

  createMarkup() { // вывод всех товаров на экран
    console.log(this.constructor.name) // имя класса из которого вызыватся метод createMarkup().
    const block = document.querySelector(this.container);
    for (let product of this.goods) {
      const productObj = new this.list[this.constructor.name](product);
      this.allProducts.push(productObj);
      block.insertAdjacentHTML('beforeend', productObj.render());
    }
  }

  
}

// Каталог товаров
class ProductsList extends List {
  constructor(cart, container = '.goods-list', url = '/catalogData.json') {
    super(container, url) // Вызываем constructor базового класса с прам-и текущего const-ra  
    this.cart = cart;
    this.getJson()
      .then(item => this.handleItem(item)) // этим методом добавляем все товары в массив this.goods[] 
                                          //  и отрисовываем все товары на экран 
                                          //  при момощи внутри метода createMarkup()
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

// Класс базовый для товара каталога и товара корзины
class Item {
  constructor(el, img = `src="image/iMac.jpeg"`) {
    this.title = el.product_name;
    this.price = el.price;
    this.id = el.id_product;
    this.img = img;
  }
  render() { // генерация товара для каталога товара
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

//Каталог товара
class ProductItem extends Item {}
// Цели конструктора каталога и корзины одна и таже:
// 1) Регистрация событий по клику на кнопку купить
// 2) Заполнить массив товаров из файла JSON
// 3) Вывод данных на странице, используя метод HandleData(), который заполняет глобальный массив товаров и воводит их на странице, вызывая метод createMarkup().

// Класс одного товара корзины
class CartItem extends Item {
  constructor(el) {
    super(el) // Вызываем constructor базового класса с прам-и текущего const-ra  
    this.quantity = el.quantity;
  }

  render() { // генерация товара для корзины.
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

// Список товаров корзины
class Cart extends List {
  constructor(container = '.basket-products', url = '/getBasket.json') {
    super(container, url) // Вызываем constructor базового класса с прам-и текущего const-ra  
    this.getJson() 
      .then(item => this.handleItem(item.contents));
  }

  // данный метод открывает корзину и также запускает метод возможности удаления товара.
  _init() {
    btnEl.addEventListener('click', () => {bsketEls.classList.toggle('none')});
    document.querySelector(this.container).addEventListener('click', e => {
      if(e.target.closest('.del-btn')) {
        this.removeProduct(e.target);
      }
    })
  }

  addProduct(elem) {
    this.getJson(`${API_URL}/addToBasket.json`) // получаем разрешение на добавление
          .then(item => { 
            if(item.result === 1) { // если разрешено, то проверяем есть ли такой товар в корзине
              const productId = +elem.dataset.id; // у переданного элемента берем id.
              const find = this.allProducts.find(product => product.id === productId); // у всех товаров данного данного класса через  метод find находим первый товар с id переданного элемента(elem)
              if(find) { // если true, то мы значит данный товар есть в корзине и мы заходим в это условие
                find.quantity++;
                this._changeMarkup(find);
              } else { // а если товара нет, то мы заходи в else и создаем новый товар
                let product = { // создаем новый товар
                  id_product: productId,
                  product_name: elem.dataset.name,
                  price: +elem.dataset.price,
                  quantity: 1
                }
                this.goods = [product]; // записываем его в goods
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
              if(find.quantity > 1) { // если кол-во больше одного, то уменьшаем на один и перерисовываем.
                find.quantity--; 
                this._changeMarkup(find);
              } else { // если кол-во один, то удаляем
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

// универсальный объект по которому будем находить класс при верстве createMarkup()
const list2 = {
  ProductsList: ProductItem, 
  Cart: CartItem,
}

const cart = new Cart();
const products = new ProductsList(cart); // Если мы хотим использовать в классе методы другого класса, 
                                        // то удобнее    всего в конструктор передать объект класса, методы которого нам нужны в данном классе.

