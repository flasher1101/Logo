'use strict';

const popupLinks = document.querySelectorAll('.popup-open');
const body = document.body;
const lockPadding = document.querySelectorAll('.lock-padding');

let unlockTimeout = null;

const timeout = 800;

for (let index = 0; index < popupLinks.length; index++) {
  const popupLink = popupLinks[index];
  popupLink.addEventListener('click', function(e) {
    const popupName = popupLink.getAttribute('href').replace('#', '');
    const currentPopup = document.getElementById(popupName);
    popupOpen(currentPopup);
    e.preventDefault();
  });

}

const popupCloseIcons = document.querySelectorAll('.popup-close');

for (let index = 0; index < popupCloseIcons.length; index++) {
  const popupCloseIcon = popupCloseIcons[index];
  popupCloseIcon.addEventListener('click', function(e) {
    popupClose(popupCloseIcon.closest('.popup'));
    e.preventDefault();
  });
}

function popupOpen(currentPopup) {
  if (currentPopup) {
    const popupActive = document.querySelector('.popup.open');

    if (popupActive) {
      popupClose(popupActive);
    } else {
      bodyLock();
    }

    currentPopup.classList.add('open');
    currentPopup.addEventListener('click', function (e) {
      if (e.target.classList.contains('popup__body')) {
        popupClose(e.currentTarget);
      }
    });
  }
}

function popupClose(popupActive, doUnlock = true) {
    popupActive.classList.remove('open');
    if (doUnlock) {
      bodyUnlock();
    }
}

function bodyLock() {
  const lockPaddingValue = window.innerWidth - document.clientWidth + 'px';

  for (let index = 0; index < lockPadding.length; index++) {
    const el = lockPadding[index];
    el.style.paddingRight = lockPaddingValue;
  }

  body.style.paddingRight = lockPaddingValue;

  body.classList.add('lock');
  clearTimeout(unlockTimeout);
}

function bodyUnlock() {
  unlockTimeout = setTimeout(function() {
    for (let index = 0; index < lockPadding.length; index++) {
      const el = lockPadding[index];
      el.style.paddingRight = '';
    }

    body.style.paddingRight = '';
    body.classList.remove('lock');
  }, timeout);
}

window.addEventListener('keydown', function (e) {
  if (e.which === 27) {
    const popupActive = document.querySelector('.popup.open');
    popupClose(popupActive);
  }
})
