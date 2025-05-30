window.Webflow ||= [];
window.Webflow.push(() => {
  // Configuration
  const MAX_ROT_Y = 40; // max ±Y tilt in degrees
  const MAX_ROT_X = 20; // max ±X tilt in degrees

  let winW = window.innerWidth;
  let winH = window.innerHeight;
  let maxDist = Math.hypot(winW, winH);

  // Grab elements & prepare GSAP quickSetters
  const sectionEl = document.querySelector('.card-section.is-cards-fan');
  const CARDS_SELECTOR = '.card-info-wrapper';
  const cards = document.querySelectorAll(CARDS_SELECTOR);
  const mover = document.querySelector('.tri-button-move');

  // centre the mover on its x/y and make it fixed (CSS can override if needed)
  let moverSetX: ((v: number) => void) | undefined;
  let moverSetY: ((v: number) => void) | undefined;
  if (mover) {
    console.debug('mover', mover);
    gsap.set(mover, {
      position: 'fixed',
      xPercent: -50,
      yPercent: -50,
    });
    moverSetX = gsap.quickSetter(mover, 'x', 'px') as (v: number) => void;
    moverSetY = gsap.quickSetter(mover, 'y', 'px') as (v: number) => void;
  }

  // prepare each card for rotation
  const rotYSetters = new Map<HTMLElement, (v: number) => void>();
  const rotXSetters = new Map<HTMLElement, (v: number) => void>();
  cards.forEach((card) => {
    rotYSetters.set(card, gsap.quickSetter(card, 'rotationY', 'deg') as (v: number) => void);
    rotXSetters.set(card, gsap.quickSetter(card, 'rotationX', 'deg') as (v: number) => void);
  });

  // update maxDist if the window resizes
  window.addEventListener('resize', () => {
    winW = window.innerWidth;
    winH = window.innerHeight;
    maxDist = Math.hypot(winW, winH);
  });

  sectionEl.addEventListener('mouseenter', (e) => {
    cards.forEach((card) => {
      const { rotY, rotX } = getCardRotation(card, e);
      gsap.to(card, {
        rotationX: rotX,
        rotationY: rotY,
        duration: 0.3,
      });
    });

    sectionEl.addEventListener('mousemove', mouseMoveHandler);
  });

  // Mousemove handler: move the button & tilt the cards
  const mouseMoveHandler = (e: MouseEvent) => {
    const mx = e.clientX;
    const my = e.clientY;

    // 1) move the fixed .tri-button-move
    if (moverSetX && moverSetY) {
      moverSetX(mx);
      moverSetY(my);
    }

    // 2) "look-at" rotation for each card
    cards.forEach((card) => {
      const { rotY, rotX } = getCardRotation(card, e);
      rotYSetters.get(card)?.(rotY);
      rotXSetters.get(card)?.(rotX);
    });
  };

  // reset card rotation on mouseleave
  sectionEl.addEventListener('mouseleave', () => {
    gsap.to(CARDS_SELECTOR, {
      rotationX: 0,
      rotationY: 0,
      duration: 0.3,
    });

    sectionEl.removeEventListener('mousemove', mouseMoveHandler);
  });

  function getCardRotation(card: HTMLElement, mouseEv: MouseEvent) {
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const cardWidth = rect.width;
    const cardHeight = rect.height;

    const mx = mouseEv.clientX;
    const my = mouseEv.clientY;

    const dx = mx - cx;
    const dy = my - cy;
    const pctX = gsap.utils.clamp(-1, 1, dx / (cardWidth / 2));
    const pctY = gsap.utils.clamp(-1, 1, dy / (cardHeight / 2));

    const dist = Math.hypot(dx, dy);
    const prox = gsap.utils.clamp(0, 1, dist / maxDist);

    const rotY = gsap.utils.clamp(-MAX_ROT_Y, MAX_ROT_Y, MAX_ROT_Y * pctX * prox);
    const rotX = gsap.utils.clamp(-MAX_ROT_X, MAX_ROT_X, MAX_ROT_X * -pctY * prox);

    return {
      rotY,
      rotX,
    };
  }
});
