window.Webflow ||= [];
window.Webflow.push(() => {
  ScrollSmoother.create({
    wrapper: '#smooth-wrapper',
    content: '#smooth-content',
    smooth: 1.2,
    effects: false, // set to true if you want to use data-speed etc.
  });
});
