export const BLOG_POSTS = [
  {
    slug: 'nairobi-rush-hour-traffic-thika-mombasa-waiyaki',
    title: 'Nairobi Traffic at Rush Hour: Thika Road, Mombasa Road, and Waiyaki Way',
    description:
      'When Nairobi\u2019s busiest roads actually slow down, and how live traffic routing helps you avoid the worst of it.',
    publishedLabel: 'Guide',
    body: [
      {
        heading: 'Rush hour isn\u2019t one fixed window',
        paragraphs: [
          'Ask anyone who commutes into Nairobi CBD and you\u2019ll get a slightly different answer for when traffic gets bad \u2014 because it depends on the road, the day, and what\u2019s happening in town that day (a rally, a school run, rain). But there are patterns.',
          'Morning traffic heading into the city on Thika Road, Mombasa Road, and Waiyaki Way tends to build from around 6:30am and is usually heaviest between 7:00 and 9:00am. In the evening, the same roads slow down outbound roughly between 4:30 and 7:30pm, with Friday evenings typically worse than the rest of the week.'
        ]
      },
      {
        heading: 'Why the same road isn\u2019t always the same route',
        paragraphs: [
          'A road that\u2019s fast at 10am can be a parking lot at 5pm, and an accident or matatu breakdown can change that in minutes. Static directions \u2014 the kind that just calculate distance and speed limit \u2014 don\u2019t account for any of this.',
          'Live traffic routing looks at what\u2019s actually happening on the road right now, not an average from a normal day. That\u2019s the difference between a route that\u2019s technically shortest and one that\u2019s actually fastest at the moment you\u2019re leaving.'
        ]
      },
      {
        heading: 'Checking before you leave',
        paragraphs: [
          'If you\u2019re commuting along Thika Road, Mombasa Road, Waiyaki Way, Ngong Road, or Uhuru Highway, it\u2019s worth checking current conditions before you set off rather than assuming yesterday\u2019s traffic pattern holds today.'
        ]
      }
    ]
  },
  {
    slug: 'fastest-route-nairobi-cbd-karen-langata-kikuyu-kasarani',
    title: 'Getting to Nairobi CBD From Karen, Langata, Kikuyu, and Kasarani',
    description:
      'There\u2019s no single fastest route into town from these areas \u2014 it depends on the time you leave. Here\u2019s why, and how to check in real time.',
    publishedLabel: 'Guide',
    body: [
      {
        heading: 'The "fastest route" changes by the hour',
        paragraphs: [
          'From Karen or Langata, the usual choices into CBD are Ngong Road or Langata Road onto Uhuru Highway. From Kikuyu, most people route via Waiyaki Way. From Kasarani, it\u2019s Thika Road most of the way in.',
          'Any of these can be the faster option depending on the time of day \u2014 Ngong Road backs up badly in the evening, Thika Road\u2019s bottlenecks shift depending on roadworks, and Waiyaki Way\u2019s Westlands stretch is its own thing entirely at peak hours.'
        ]
      },
      {
        heading: 'Why we don\u2019t publish one "best" route',
        paragraphs: [
          'A blog post that tells you "always take Route X" is giving you advice that\u2019s already out of date by the time you read it. Traffic conditions change hour to hour, and sometimes minute to minute.',
          'What actually works is checking live conditions right before you leave, comparing the routes for that specific moment, and letting the fastest one \u2014 not the usual one \u2014 win.'
        ]
      },
      {
        heading: 'How to check',
        paragraphs: [
          'Open ROUTEXA, set your starting point and CBD as the destination, and it\u2019ll compare current traffic across the available routes for you \u2014 no account needed.'
        ]
      }
    ]
  },
  {
    slug: 'beat-nairobi-traffic-live-routing-car-matatu-boda',
    title: 'Beating Nairobi Traffic: Car, Matatu, and Boda Boda Each Need a Different Route',
    description:
      'The fastest way across town by car often isn\u2019t the fastest way by boda \u2014 here\u2019s why routing by mode matters in Nairobi specifically.',
    publishedLabel: 'Guide',
    body: [
      {
        heading: 'One route doesn\u2019t fit every mode',
        paragraphs: [
          'A car has to stay on the main road even when it\u2019s jammed. A boda boda can filter through slow-moving traffic or cut through a route a car physically can\u2019t use well. A matatu route is often shaped by its own stage-to-stage path more than the shortest line between two points.',
          'Generic driving directions treat all of this the same way, which is part of why they feel wrong so often in Nairobi traffic specifically.'
        ]
      },
      {
        heading: 'What changes with real-time traffic',
        paragraphs: [
          'When a route is colored by current speed rather than a fixed estimate, you can see at a glance which stretch is moving and which one has stopped \u2014 before you\u2019re committed to it.',
          'That matters most exactly when it\u2019s hardest to judge from the road yourself: heavy rain, a big event downtown, or an accident a few kilometres ahead that you can\u2019t see yet.'
        ]
      },
      {
        heading: 'Try it for your commute',
        paragraphs: [
          'ROUTEXA plans routes for car, bus, and motorbike separately, each checked against live traffic \u2014 no sign-up required.'
        ]
      }
    ]
  }
]

export function getPostBySlug(slug) {
  return BLOG_POSTS.find((p) => p.slug === slug)
}
