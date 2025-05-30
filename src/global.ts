import { setCurrentYear } from '$utils/current-year';
import '$utils/disable-webflow-scroll';

gsap.registerPlugin(ScrollTrigger);

window.Webflow = window.Webflow || [];
window.Webflow?.push(() => {
  // Set current year on respective elements
  setCurrentYear();
});
