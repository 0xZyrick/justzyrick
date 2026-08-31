// ZYRICK — site behavior
// Independent, self-contained features: mobile nav, scroll reveal,
// the enquiry form shortcut on pricing plans, and the chat assistant.

(function mobileNav() {
  var toggle = document.querySelector('.nav-toggle');
  var links = document.getElementById('nav-links');
  if (!toggle || !links) return;

  function setOpen(open) {
    links.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.textContent = open ? 'Close' : 'Menu';
  }

  toggle.addEventListener('click', function () {
    setOpen(!links.classList.contains('open'));
  });
  links.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () { setOpen(false); });
  });
})();

(function scrollReveal() {
  var items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  try {
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('in-view'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.15 });

    items.forEach(function (el) { observer.observe(el); });
  } catch (err) {
    items.forEach(function (el) { el.classList.add('in-view'); });
  }
})();

(function enquiryForm() {
  var enquiry = document.getElementById('enquiry');
  if (!enquiry) return;
  var packageField = enquiry.querySelector('[name="Package"]');

  document.querySelectorAll('.plan .choose').forEach(function (button) {
    button.addEventListener('click', function () {
      var plan = button.closest('.plan');
      packageField.value = plan.querySelector('h3').textContent;
      enquiry.classList.add('open');
      enquiry.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });
})();

(function chatWidget() {
  var chat = document.querySelector('.chat');
  if (!chat) return;

  var toggle = chat.querySelector('.chat-toggle');
  var box = chat.querySelector('.chat-box');
  var close = chat.querySelector('.chat-close');
  var form = chat.querySelector('.chat-compose');
  var input = form.querySelector('input');
  var answer = chat.querySelector('.chat-answer');
  var suggestions = chat.querySelectorAll('.chat-suggestion');

  var REPLIES = [
    { test: /price|cost|package|budget/, reply: 'There are two options: a Listings Website for a clear, enquiry-ready presence, or a Custom Enquiry Site for advanced filtering, booking flows, and lead routing. I\u2019ll quote based on what you need.' },
    { test: /car|vehicle|hire|dealer|stock|inventory/, reply: 'For car dealers, the site presents your stock clearly and puts an enquiry button on every vehicle \u2014 so browsers can ask about a specific car in one tap.' },
    { test: /propert|real estate|land|listing|inspection|plot/, reply: 'For property brands, listings come first, with the details buyers need and a direct path to enquire about the right one.' },
    { test: /process|start|how.*work|step/, reply: 'It\u2019s four steps: a discovery call, the build, launch, and ongoing support. See the \u201cHow it works\u201d section above for the details.' },
    { test: /maintenance|update|support/, reply: 'Monthly maintenance keeps your listings, stock, and content current after launch. Tell me what site you have now and I can advise.' },
    { test: /work|project|portfolio|example/, reply: 'You can see recent work in the Selected Work section above \u2014 property and car dealer sites lead, with a couple of other projects further down.' },
    { test: /service|offer|website|build|make|design/, reply: 'ZYRICK builds enquiry-first websites for property brands and car dealers \u2014 clear listings, clear stock, and a direct path to contact.' },
    { test: /hello|^hi\b|contact|whatsapp|human/, reply: 'Hello! Tell me a little about your listings or your stock, and what you need the website to do.' }
  ];

  function respond(text) {
    var match = REPLIES.find(function (r) { return r.test.test(text); });
    if (match) {
      answer.textContent = match.reply;
    } else {
      answer.innerHTML = 'I don\u2019t have that on the site yet. <a href="https://wa.me/2349031912660" target="_blank" rel="noreferrer">Chat with Humble on WhatsApp -&gt;</a>';
    }
  }

  toggle.addEventListener('click', function () {
    box.classList.toggle('open');
    if (box.classList.contains('open')) input.focus();
  });
  close.addEventListener('click', function () { box.classList.remove('open'); });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var message = input.value.trim();
    if (!message) return;
    var bubble = document.createElement('div');
    bubble.className = 'chat-message';
    bubble.textContent = message;
    form.before(bubble);
    respond(message.toLowerCase());
    input.value = '';
    input.focus();
  });

  suggestions.forEach(function (button) {
    button.addEventListener('click', function () {
      input.value = button.textContent;
      form.requestSubmit();
    });
  });
})();
