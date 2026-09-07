/*
 * Single source of truth for what the suite covers.
 *
 * Every page of all three properties lives here. Add a page here and it is
 * automatically picked up by the page, link, footer and layout specs.
 *
 * TARGET=prod (default) tests the live sites.
 * TARGET=local tests local copies; see README for the servers that expects.
 */

const TARGET = process.env.TARGET === 'local' ? 'local' : 'prod';

const ORIGINS = {
  prod: {
    main: 'https://yaelfried.com',
    landing: 'https://breaktheloop.yaelfried.com',
    links: 'https://links.yaelfried.com',
  },
  local: {
    main: 'http://localhost:8801',
    landing: 'http://localhost:8802',
    links: 'http://localhost:8803',
  },
};

const origin = ORIGINS[TARGET];

/*
 * The main site. `alt` is the same page in the other language, used to check
 * the EN/HE switcher points somewhere real and symmetric.
 */
const mainPages = [
  { path: '/',                     lang: 'he', alt: '/home-en',            form: true  },
  { path: '/home-en',              lang: 'en', alt: '/',                   form: true  },
  { path: '/about-he',             lang: 'he', alt: '/about'                           },
  { path: '/about',                lang: 'en', alt: '/about-he'                        },
  { path: '/process-he',           lang: 'he', alt: '/process'                         },
  { path: '/process',              lang: 'en', alt: '/process-he'                      },
  { path: '/treatment-he',         lang: 'he', alt: '/treatment'                       },
  { path: '/treatment',            lang: 'en', alt: '/treatment-he'                    },
  { path: '/contact-he',           lang: 'he', alt: '/contact',            form: true  },
  { path: '/contact',              lang: 'en', alt: '/contact-he',         form: true  },
  { path: '/trace-suggestion-he',  lang: 'he', alt: '/trace-suggestion'                },
  { path: '/trace-suggestion',     lang: 'en', alt: '/trace-suggestion-he'             },
].map((p) => ({ ...p, site: 'main', url: origin.main + p.path }));

const landingPages = [
  { path: '/', lang: 'he', form: true, site: 'landing', url: origin.landing + '/' },
];

const linksPages = [
  { path: '/', lang: 'he', site: 'links', url: origin.links + '/' },
];

const allPages = [...mainPages, ...landingPages, ...linksPages];

/* The social accounts that must appear in the footer of all three sites. */
const SOCIALS = {
  instagram: 'instagram.com/yaelfried_',
  facebook: 'facebook.com/',
  youtube: 'youtube.com/@yaelfried',
  tiktok: 'tiktok.com/@yael.fried',
};

/* Formspree endpoints. The forms specs assert these are wired up but never
 * actually submit to them: every request is intercepted and aborted so no
 * test lead ever reaches the real inbox. */
const FORM_ENDPOINTS = {
  main: 'https://formspree.io/f/xbdvrqal',
  landing: 'https://formspree.io/f/mbdbnqjy',
};

const VIEWPORTS = {
  mobile: { width: 390, height: 844 },
  desktop: { width: 1440, height: 900 },
};

/* Widths checked for horizontal overflow. 320 is the narrowest phone still
 * in real use; 810 is just under the main site's mobile/tablet switch. */
const OVERFLOW_WIDTHS = [320, 360, 375, 390, 414, 600, 810, 1024, 1280, 1440];

module.exports = {
  TARGET,
  origin,
  mainPages,
  landingPages,
  linksPages,
  allPages,
  SOCIALS,
  FORM_ENDPOINTS,
  VIEWPORTS,
  OVERFLOW_WIDTHS,
};
