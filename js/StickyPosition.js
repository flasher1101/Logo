'use strict';
function throttle(func, ms) {

  let isThrottled = false,
  savedArgs,
  savedThis;

  function wrapper() {

    if (isThrottled) {
      savedArgs = arguments;
      savedThis = this;
      return;
    }
    isThrottled = true;

    func.apply(this, arguments);
    savedArgs = savedThis = null;

    setTimeout(function() {
      isThrottled = false;
      if (savedArgs) {
        wrapper.apply(savedThis, savedArgs);
      }
    }, ms);
  }

  return wrapper;
}

function requestFrameWrapper(func) {
  let ticking = false;

  return function wrappper() {
    if (!ticking) {
      requestAnimationFrame(() => {
        ticking = false;
        func.apply(this, arguments)
      });
    }

    ticking = true;
  }
}


class StickyPosition {
  constructor(selector, options = {}) {
    this.$elem = document.getElementsByClassName(selector)[0];
    this.options = options;

    this.$replacement = document.createElement('div');
    this.isSticky = false;

    this.updateReplacementHeight();
    this.setup();
    this.updateStickyState();
  }

  setup() {
    this.setupOptions();
    this.setupHandlers();
    this.setupListeners();
    this.setupObserver();
    this.setupCustomEvents();
    this.setupHiding();
  }

  setupOptions() {
    const defaults = {
      scrollThrottle: 150,
      hidingBehaviour: 'none',
      autoHideTime: 3000,
      startStickyCoord: 'top',
      throttleType: 'smooth'
    }

    this.options = Object.assign({}, defaults, this.options);
  }

  setupHandlers() {
    this.scrollHandler = this.scrollHandler.bind(this);

    if (this.options.throttleType === 'throttle') {
      this.scrollHandler = throttle(this.scrollHandler, this.options.scrollThrottle);
    } else {
      this.scrollHandler = requestFrameWrapper(this.scrollHandler);
    }

    this.resizeHandler = this.resizeHandler.bind(this);
  }

  setupListeners() {
    window.addEventListener('scroll', this.scrollHandler);
    window.addEventListener('resize', this.resizeHandler);

    let onDestroy = () => {
      this.cancelSticky();
      window.removeEventListener('scroll', this.scrollHandler);
      window.removeEventListener('resize', this.resizeHandler);
      this.$elem.removeEventListener('destroy', onDestroy);
    }

    this.$elem.addEventListener('destroy', onDestroy);
  }

  setupObserver() {
    this.observerCallback = this.observerCallback.bind(this);

    this.observer = new MutationObserver(this.observerCallback);

    this.observer.observe(this.$elem, {
      childList: true,
      subtree: true,
      characterData: true
    });

    let onDestroy = () => {
      this.observer.disconnect();
      this.$elem.removeEventListener('destroy', onDestroy);
    }

    this.$elem.addEventListener('destroy', onDestroy);
  }

  observerCallback() {
    this.updateReplacementHeight();
  }


  scrollHandler(event) {
    this.updateStickyState();
    this.$elem.dispatchEvent(this.scrollEvent);
  }

  updateStickyState() {
    let stickyCoord = this.getStickyElemStartCoord();
    if (stickyCoord < 0 && !this.isSticky) {
      this.enableSticky();
    } else if (stickyCoord >= 0 && this.isSticky) {
      this.cancelSticky();
    }
  }

  enableSticky() {
    this.isSticky = true;
    this.setReplacement();
    this.$elem.classList.add('sticky');
    this.$elem.dispatchEvent(this.stickyEnabledEvent);
    this.$elem.style.transition = '';
  }

  cancelSticky() {
    this.isSticky = false;
    this.removeReplacement();
    this.$elem.classList.remove('sticky');
    this.$elem.style.transition = 'none';
    this.$elem.dispatchEvent(this.stickyCanceledEvent);
  }

  setReplacement() {
    this.$elem.before(this.$replacement);
  }

  removeReplacement() {
    this.$replacement.remove();
  }

  getStickyElemStartCoord() {
    let startSticky = this.options.startStickyCoord;
    if (!this.isSticky) {
      return this.$elem.getBoundingClientRect()[startSticky];
    }

    return  this.$replacement.getBoundingClientRect()[startSticky];
  }

  resizeHandler(event) {
    this.updateReplacementHeight();
  }

  updateReplacementHeight() {
    this.$replacement.style.height = this.$elem.offsetHeight + 'px';
  }

  setupCustomEvents() {
    this.stickyEnabledEvent = new CustomEvent('stickyEnabled');
    this.stickyCanceledEvent = new CustomEvent('stickyCanceled');
    this.destroyEvent = new CustomEvent('destroy');
    this.scrollEvent = new CustomEvent('scrollEvent');
  }

  setupHiding() {
    let hideBhv = this.options.hidingBehaviour;

    if (hideBhv === 'none') return;
    if (hideBhv === 'onScrollDown') {
      this.setupOnScrollDownHide();
    } else if (hideBhv === 'autoHide'){
      this.setupAutoHide();
    }
  }

  setupOnScrollDownHide() {
    let lastScroll = scrollY;
    let hidden = false;
    let onStickyEnabled = function(e) {
      console.log('hey');
      this.$elem.addEventListener('scrollEvent', onScroll);
    };

    let onStickyCanceled = function(e) {
      this.$elem.removeEventListener('scrollEvent', onScroll);
    };

    let onScroll = function(e) {
      if (scrollY > lastScroll && !hidden) {
        this.$elem.classList.add('hide');
        hidden = true;
      } else if (scrollY < lastScroll && hidden) {
        this.$elem.classList.remove('hide');
        hidden = false;
      }

      lastScroll = scrollY;
    };


    onStickyEnabled = onStickyEnabled.bind(this);
    onStickyCanceled = onStickyCanceled.bind(this);
    onScroll = onScroll.bind(this);

    this.$elem.addEventListener('stickyEnabled', onStickyEnabled);
    this.$elem.addEventListener('stickyCanceled', onStickyCanceled);

    let onDestroy = () => {
      this.$elem.classList.remove('hide');
      onStickyCanceled();
      this.$elem.removeEventListener('stickyEnabled', onStickyEnabled);
      this.$elem.removeEventListener('stickyCanceled', onStickyCanceled);
      this.$elem.removeEventListener('destroy', onDestroy);
    }

    this.$elem.addEventListener('destroy', onDestroy);
  }

  setupAutoHide() {
    let lastScroll = scrollY;
    let hidden = false;
    let timeout;
    let onStickyEnabled = (e) => {
      this.hide();
      this.$elem.addEventListener('scrollEvent', onScroll);
    };

    let onStickyCanceled = (e) => {
      this.show();
      this.$elem.removeEventListener('scrollEvent', onScroll);
    };

    let onScroll = (e) => {
      if (scrollY > lastScroll && !hidden) {
        this.hide();
      } else if (scrollY < lastScroll && hidden) {
        this.show();
        this.hide();
      }

      lastScroll = scrollY;
    };

    this.show = () => {
      hidden = false;
      clearTimeout(timeout);
      this.$elem.classList.remove('hide');
    }

    this.hide = () => {
      hidden = true;
      timeout = setTimeout(() => {
        this.$elem.classList.add('hide');
      }, this.options.autoHideTime);
    }

    this.hideDisable = () => {
      onStickyCanceled();
    }

    this.hideEnable = () => {
      onStickyEnabled();
    }

    let destroyEvents = () => {
      this.$elem.classList.remove('hide');
      onStickyCanceled();
      this.$elem.removeEventListener('stickyEnabled', onStickyEnabled);
      this.$elem.removeEventListener('stickyCanceled', onStickyCanceled);
      this.$elem.removeEventListener('destroy', destroyEvents);
    }

    this.$elem.addEventListener('stickyEnabled', onStickyEnabled);
    this.$elem.addEventListener('stickyCanceled', onStickyCanceled);
    this.$elem.addEventListener('destroy', destroyEvents);
  }

  destroy() {
    this.$elem.dispatchEvent(this.destroyEvent);
  }
}
