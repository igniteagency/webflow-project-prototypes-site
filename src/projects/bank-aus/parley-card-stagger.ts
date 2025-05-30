class ParleyCardStagger {
  private CARD_DURATION = 0.6;
  private STAGGER = 0.15;
  private SHADOW_START_AT = 0.8;

  private fromCards: HTMLElement[];
  private toSlots: HTMLElement[];

  constructor() {
    this.fromCards = gsap.utils.toArray('.cards-from .card') as HTMLElement[];
    this.toSlots = gsap.utils.toArray('.cards-to .card4') as HTMLElement[];
    this.logDomNodes();
    this.setupCardAnimation();
    this.setupScrollTriggerRefresh();
    console.debug('Initial script execution finished.');
  }

  private logDomNodes() {
    if (this.fromCards.length === 0) {
      console.warn("No '.cards-from .card' elements found.");
    } else {
      console.debug(`Found ${this.fromCards.length} 'fromCards'`);
    }

    if (this.toSlots.length === 0 && this.fromCards.length > 0) {
      console.warn("No '.cards-to .card4' elements found for the first animation.");
    } else if (this.fromCards.length > 0) {
      console.debug(`Found ${this.toSlots.length} 'toSlots'`);
    }
  }

  private setupCardAnimation() {
    console.debug('Setting up First Animation (Cards to Slots)...');
    if (
      this.fromCards.length > 0 &&
      this.toSlots.length > 0 &&
      this.fromCards.length <= this.toSlots.length
    ) {
      console.debug('Conditions met for First Animation setup.');
      const tl = gsap.timeline({ paused: true });
      const last = this.fromCards.length - 1;

      this.fromCards.forEach((card, i) => {
        const slotIndex = last - i;
        const slot = this.toSlots[slotIndex];
        if (!slot) {
          console.warn(
            `First Animation: Slot with index ${slotIndex} not found for card ${i}. Skipping.`
          );
          return;
        }
        const state = Flip.getState(card, { props: 'filter,opacity,transform' });
        slot.appendChild(card);
        const shadowEl = slot.querySelector<HTMLElement>('.card-shadow-wrap');
        const labelTime = slotIndex * this.STAGGER;
        tl.addLabel(`card${i}`, labelTime);
        const flipTween = Flip.from(state, {
          targets: card,
          duration: this.CARD_DURATION,
          ease: 'power1.inOut',
          scale: true,
          absolute: true,
          props: 'filter,opacity,transform',
        });
        tl.add(flipTween, `card${i}`);
        tl.fromTo(
          card,
          { rotateY: 0, transformOrigin: 'center center' },
          { rotateY: -50, duration: this.CARD_DURATION, ease: 'power1.inOut' },
          `card${i}`
        );
        if (shadowEl) {
          gsap.set(shadowEl, { opacity: 0, filter: 'blur(100px)' });
          flipTween.eventCallback('onUpdate', () => {
            const p = flipTween.progress();
            // MODIFIED Z-INDEX LOGIC:
            // Sets zIndex to 'auto' when scrolling down past SHADOW_START_AT
            // Clears inline zIndex (reverting to CSS) when scrolling up past SHADOW_START_AT
            if (p >= this.SHADOW_START_AT) {
              gsap.set(slot, { zIndex: 'auto' });
            } else {
              gsap.set(slot, { clearProps: 'zIndex' }); // Reverts to CSS defined z-index
            }
            const alpha = gsap.utils.clamp(
              0,
              1,
              (p - this.SHADOW_START_AT) / (1 - this.SHADOW_START_AT)
            );
            const blurValue = 100 * (1 - alpha);
            gsap.set(shadowEl, { opacity: alpha, filter: `blur(${blurValue}px)` });
          });
        }
      });
      const cardsToTrigger = document.querySelector<HTMLElement>('.cards-to');
      if (cardsToTrigger) {
        console.debug("First Animation: Creating ScrollTrigger for '.cards-to'.");
        ScrollTrigger.create({
          animation: tl,
          trigger: cardsToTrigger,
          start: 'top+=15% bottom',
          end: 'bottom bottom',
          scrub: true,
        });
      } else {
        console.warn("First Animation: '.cards-to' trigger not found for ScrollTrigger.");
      }
    } else {
      console.debug(
        'Conditions NOT met for First Animation setup. fromCards.length:',
        this.fromCards.length,
        'toSlots.length:',
        this.toSlots.length
      );
    }
  }

  private setupScrollTriggerRefresh() {
    console.debug("Adding window 'load' event listener for ScrollTrigger.refresh().");
    window.addEventListener('load', () => {
      console.debug("Window 'load' event fired. Calling ScrollTrigger.refresh().");
      ScrollTrigger.refresh();
      console.debug('ScrollTrigger.refresh() called.');
    });
  }
}

window.Webflow ||= [];
window.Webflow.push(() => {
  new ParleyCardStagger();
});
