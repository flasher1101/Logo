const da = new DynamicAdapt("max");
da.init();
const menu = document.querySelector('.menu');
const body = document.body;
const header = document.querySelector('.header');

(function (){const toggleMenu = document.querySelector('.menu__toggle');

const openedMenuEvent = new CustomEvent('menuOpen');
const closedMenuEvent = new CustomEvent('menuClose');


toggleMenu.addEventListener('click', () => {
  if (menu.classList.contains('menu--opened')) {
    body.dispatchEvent(closedMenuEvent);
    menu.classList.remove('menu--opened');
    bodyLockToggle(300);
  } else {
    body.dispatchEvent(openedMenuEvent);
    menu.classList.add('menu--opened');
    bodyLockToggle(300);
  }
});
})();

let bodyLockStatus = true;

function bodyLockToggle (delay = 500) {
  if (document.documentElement.classList.contains('lock')) {
    bodyUnlock(delay);
  } else {
    bodyLock(delay);
  }
}

function bodyUnlock (delay = 500) {
  const body = document.body;
  if (bodyLockStatus) {
    let lock_padding = document.querySelectorAll("[data-lp]");
    setTimeout(() => {
      for (let index = 0; index < lock_padding.length; index++) {
        const el = lock_padding[index];
        el.style.paddingRight = '0px';
      }
      body.style.paddingRight = '0px';
      document.documentElement.classList.remove("lock");
    }, delay);
    bodyLockStatus = false;
    setTimeout(function () {
      bodyLockStatus = true;
    }, delay);
  }
}

function bodyLock (delay = 500) {
  let body = document.querySelector("body");
  if (bodyLockStatus) {
    let lock_padding = document.querySelectorAll("[data-lp]");
    for (let index = 0; index < lock_padding.length; index++) {
      const el = lock_padding[index];
      el.style.paddingRight = window.innerWidth - document.querySelector('.wrapper').offsetWidth + 'px';
    }
    body.style.paddingRight = window.innerWidth - document.querySelector('.wrapper').offsetWidth + 'px';
    document.documentElement.classList.add("lock");

    bodyLockStatus = false;
    setTimeout(function () {
      bodyLockStatus = true;
    }, delay);
  }
}

// Sticky header

let stickyHeader;

mobileMediaQs = window.matchMedia('(max-width: 767px)');

mobileMediaQs.addListener(updateStickyHeader);

updateStickyHeader();

header.addEventListener('stickyEnabled', () => {
  header.setAttribute('data-lp', '');
});

header.addEventListener('stickyCanceled', () => {
  header.removeAttribute('data-lp');
});

body.addEventListener('menuOpen', () => {
  if (stickyHeader && stickyHeader.isSticky) {
    stickyHeader.hideDisable();
  }
});

body.addEventListener('menuClose', () => {
  if (stickyHeader && stickyHeader.isSticky) {
    stickyHeader.hideEnable();
  }
});

function updateStickyHeader() {
  if (mobileMediaQs.matches) {
    stickyHeader = new StickyPosition('header', {
      hidingBehaviour: 'autoHide',
      autoHideTime: 2000,
      throttleType: 'smooth',
      scrollThrottle: 150,
      startStickyCoord: 'top'
    });
  } else if (stickyHeader) {
    stickyHeader.destroy();
  }
}

// catalog menu

const catalogMenu = document.querySelector('.catalog-menu');
const catalogMenuList = document.querySelector('.catalog-menu__list');
const catalogMenuParentItems = document.querySelectorAll('.catalog-menu__item--parent');
const catalogMenuBtn = document.querySelector('.catalog-menu__button');
const catalogSubmenuList = document.querySelectorAll('.catalog-submenu');

_slideUp(catalogMenuList, 0);

catalogMenuBtn.addEventListener('click', (e) => {
  catalogMenu.classList.toggle('catalog-menu--opened');
  _slideToggle(catalogMenuList, 300);
  closeParentItems();
});

let max991Media = window.matchMedia('(max-width: 991.98px)');

if (!max991Media.matches) {
  catalogSubmenuList.forEach(el => {
    el.removeAttribute('hidden');
  })
}

function closeParentItems() {

  catalogMenuParentItems.forEach(element => {
    element.classList.remove('catalog-menu__item--opened');
  });

  if (max991Media.matches) {
    catalogSubmenuList.forEach(element => {
      _slideUp(element);
    });
  }
}

max991Media.addListener(() => {
  catalogMenu.classList.remove('catalog-menu--opened');
  closeParentItems();
  _slideUp(catalogMenuList, 0);
  if (!max991Media.matches) {
    catalogSubmenuList.forEach(el => {
      el.removeAttribute('hidden');
    })
  }
});

catalogMenuList.addEventListener('click', (e) => {
  const parentItem = e.target.parentElement;
  if (!parentItem.classList.contains('catalog-menu__item--parent')) return;

  e.preventDefault();

  let isOpened = parentItem.classList.contains('catalog-menu__item--opened');
  if (max991Media.matches && !isOpened) {
    let subMenu = parentItem.querySelector('.catalog-submenu');
    _slideDown(subMenu);
  }

  closeParentItems();
  if (isOpened) return;
  parentItem.classList.toggle('catalog-menu__item--opened');
});

// catalog-search

if (document.querySelector('.catalog-search')) {

  const SearchSelectBtn = document.querySelector('.catalog-search__select-btn');
  const SearchCategories = document.querySelector('.catalog-search__categories');
  let selected = document.querySelector('.catalog-search__select-btn span:last-of-type');

  _slideUp(SearchCategories);

  SearchSelectBtn.addEventListener('click', (e) => {
    SearchSelectBtn.classList.toggle('active');
    _slideToggle(SearchCategories);
    e.preventDefault();
  });

  SearchCategories.addEventListener('change', (e) => {
    let checkedItems = document.querySelectorAll('input:checked');
    console.log(checkedItems);
    if (checkedItems.length > 0) {
      SearchSelectBtn.classList.add('selected');
      selected.textContent = SearchSelectBtn.dataset.text + ' ' + checkedItems.length;
    } else {
      SearchSelectBtn.classList.remove('selected');
      selected.textContent = '';
    }
  });
}
// promo slider

if (document.querySelector('.promo-main__slider')) {

  let promoMainSlider = new Swiper('.promo-main__slider', {

    observer: true,
    observeParents: true,
    slidesPerView: 1,
    spaceBetween: 0,
    autoHeight: true,

    pagination: {
      el: '.promo-main__pagination',
      clickable: true
    },
  });

  const promoBgImages = document.querySelectorAll('.promo-main__img img');
  const promoBullets = document.querySelectorAll('.swiper-pagination-bullet');

  for (let index = 0; index < promoBgImages.length; index++) {
    const imageSrc = promoBgImages[index].getAttribute('src');
    promoBullets[index].style.backgroundImage = `url(${imageSrc})`;
  }
}


// products-slider
if (document.querySelector('.products-slider--popular .products-slider__slider')) {

  let productsSwiper = new Swiper('.products-slider--popular .products-slider__slider', {

    observer: true,
    observeParents: true,
    slidesPerView: 1,
    spaceBetween: 0,
    autoHeight: true,
    loop: true,

    pagination: {
      el: '.products-slider--popular .products-slider__pagination',
      type: 'fraction',
    },

    navigation: {
      nextEl: '.products-slider--popular .products-slider__arrow-next',
      prevEl: '.products-slider--popular .products-slider__arrow-prev',
    },
  });
}

if (document.querySelector('.brands-slider')) {

  let brandsSwiper = new Swiper('.brands-slider__inner', {
    observer: true,
    observeParents: true,
    slidesPerView: 5,
    spaceBetween: 0,
    loop: true,

    navigation: {
      nextEl: '.brands-slider__arrow-next',
      prevEl: '.brands-slider__arrow-prev',
    },

    breakpoints: {
      320: {
        slidesPerView: 1,
      },
      440: {
        slidesPerView: 2,
      },
      600: {
        slidesPerView: 3,
      },
      768: {
        slidesPerView: 4,
      },
      992: {
        slidesPerView: 5,
      },
    },
  });
}

// about company

const aboutCompany = document.querySelector('.about-company');

if (aboutCompany) {
  aboutCompany.addEventListener('click', (e) => {
    let expandBtn = e.target.closest('.about-company__expand-btn');
    if (!expandBtn) return;

    let inner = expandBtn.parentElement.querySelector('.about-company__inner');

    inner.classList.toggle('active');
    if (expandBtn.textContent === '...Show more') {
      expandBtn.textContent = '...Show less';
    } else {
      expandBtn.textContent = '...Show more';
    }
  })
}

// price filter



let priceSlider = document.querySelector('.price-filter__slider');

if (priceSlider) {
  noUiSlider.create(priceSlider, {
    start: [0, 200000],
    connect: true,
    tooltips: true,

    format: {
      to: function (value) {
        return Math.round(value);
      },
      from: function (value) {
        return Math.round(value);
      }
    },

    step: 1,
    range: {
      'min': 0,
      'max': 200000
    }
  });

  const inputMin = document.getElementById('price-input-min');
  const inputMax = document.getElementById('price-input-max');

  const inputs = [inputMin, inputMax];

  priceSlider.noUiSlider.on('update', (values, handle) => {
    inputs[handle].value = values[handle];
  });

  const setRangeSlider = (i, value) => {
    let arr = [null, null];
    arr[i] = value;
    priceSlider.noUiSlider.set(arr);
  }

  inputs.forEach((el, index) => {
    el.addEventListener('change', (e) => {
      setRangeSlider(index, el.value);
    })
  })
}
// catalog filter

const catFiltTitle = document.querySelector('.catalog-filter__title');
const catFiltBody = document.querySelector('.catalog-filter__body');

if (catFiltTitle) {
  catFiltTitle.addEventListener('click', (e) => {
    _slideToggle(catFiltBody);
    catFiltTitle.classList.toggle('active');
  });
}

// compare filter

// filter spollers
try {
  spollers();
} catch {
  console.log('no spollers');
}
// catalog filter

// images-product-sliders

if (document.querySelector('.images-product__main')) {
  let productThumbSwiper


  productThumbSwiper = new Swiper('.images-product__thumb', {
    observer: true,
    observeParents: true,
    slidesPerView: 4,
    spaceBetween: 12,
  });

  let productMainSwiper = new Swiper('.images-product__main', {
    observer: true,
    observeParents: true,
    slidesPerView: 1,
    thumbs: {
      swiper: productThumbSwiper,
    },
  });
}

// quantity

let quantities = document.querySelectorAll('.quantity');

if (quantities[0]) {
  quantities.forEach((element) => {

    let quantInput = element.querySelector('.quantity__input');
    let quantMinus = element.querySelector('.quantity__btn--minus');
    let quantPlus = element.querySelector('.quantity__btn--plus');

    let quantChangeHandler = (e) => {
      if (e.currentTarget.classList.contains('quantity__btn--minus')) {
        if (quantInput.value <= 0) return;
        quantInput.value -= 1;
      } else {
        if (quantInput.value >= 10) return;
        quantInput.value = +quantInput.value + 1;
      }
    }

    quantInput.addEventListener('change', (e) => {
      if (quantInput.value <= 0) quantInput.value = 0;
      if (quantInput.value >= 10) quantInput.value = 10;
    })

    quantMinus.addEventListener('click', quantChangeHandler);
    quantPlus.addEventListener('click', quantChangeHandler);
  });
}


// description-product tabs

const descProdItems = document.querySelectorAll('.description-product__item');

if (descProdItems[0]) {
  const descProdTabs = document.querySelector('.description-product__body').children;

  descProdItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      descProdItems.forEach((item) => {
        item.classList.remove('active');
      });

      for (let item of descProdTabs) {
        item.classList.remove('active');
      }

      item.classList.add('active');
      descProdTabs[index].classList.add('active');
    });
  });
}

//

let checkoutTabs = document.querySelector('.content-checkout');

if (checkoutTabs) {
  new ItcTabs(checkoutTabs);
}


