import type { SamplePhotoKey } from '@/sample/photos'
import type { TravelStyle } from '@/services/plans/types'

/**
 * BULK PLANNING DATA — the corpus the mock planner actually plans from.
 *
 * This is the stand-in for whatever the real backend will search. It exists so
 * that "Create our plan" does real work against real content rather than
 * returning one fixture: change the destination, the budget or the vibes and a
 * genuinely different itinerary comes back, because a different subset of these
 * moments survives the filter.
 *
 * WHY IT IS THIS BIG. A catalogue of three would have made the planner look
 * clever while having no choice to make. Five destinations at nine moments each
 * is the smallest corpus where budget and style filters visibly change the
 * answer, which is the only way to tell the planner is doing anything.
 *
 * WHEN THE BACKEND LANDS this file is deleted, not migrated. `services/planner`
 * is the seam; nothing outside `planner/mock.ts` reads this.
 */

export type CatalogueMoment = {
  id: string
  /** Which part of the day it belongs in. One of each makes a day. */
  slot: 'morning' | 'afternoon' | 'evening'
  /** Display label — "Morning café", "Sunset moment". */
  slotLabel: string
  time: string
  title: string
  description: string
  /** Whole currency units, per couple. 0 means free. */
  cost: number
  /** What it costs phrased the way the itinerary prints it. */
  costLabel?: string
  styles: TravelStyle[]
  photoKey: SamplePhotoKey | null
  photoCaption?: string
}

export type CatalogueDestination = {
  /** Matched case-insensitively against what the couple typed. */
  name: string
  aliases: string[]
  country: string
  tagline: string
  currency: '£' | '$' | '€'
  coverKey: SamplePhotoKey
  /** Day titles, cycled as the trip gets longer. */
  dayTitles: string[]
  moments: CatalogueMoment[]
}

export const PLANNER_CATALOGUE: CatalogueDestination[] = [
  {
    name: 'Paris, France',
    aliases: ['paris', 'france'],
    country: 'France',
    tagline: 'Romance capital',
    currency: '£',
    coverKey: 'parisDusk',
    dayTitles: ['First steps together', 'Seine moments', 'Rooms & starlight', 'Until next time'],
    moments: [
      {
        id: 'par-m1',
        slot: 'morning',
        slotLabel: 'Morning',
        time: '09:30 AM',
        title: 'Breakfast at a charming sidewalk café',
        description:
          'Quiet corner table at Le Chien qui Fume. Fresh warm pain au chocolat, café crème, and watching the morning cobblestone street wake up.',
        cost: 24,
        costLabel: '£24 for two',
        styles: ['foodie', 'relaxing', 'romantic'],
        photoKey: 'cafeInterior',
        photoCaption: 'Montmartre, 9:40 am',
      },
      {
        id: 'par-m2',
        slot: 'afternoon',
        slotLabel: 'Afternoon',
        time: '02:15 PM',
        title: 'Walk through secret Montmartre',
        description:
          'Wander through the quiet back alleys behind Sacré-Cœur, vintage vinyl stalls, and ivy-covered stone walls.',
        cost: 0,
        costLabel: 'Free · Priceless',
        styles: ['culture', 'romantic', 'relaxing'],
        photoKey: 'parisDay',
        photoCaption: '2.5 km gentle walking',
      },
      {
        id: 'par-m3',
        slot: 'evening',
        slotLabel: 'Sunset moment',
        time: '07:30 PM',
        title: 'Sunset picnic overlooking Paris',
        description:
          'Linen blanket, fresh baguette, soft cheese, and two glasses of pinot noir on the Montmartre overlook as the Eiffel tower lights shimmer.',
        cost: 52,
        styles: ['romantic', 'foodie'],
        photoKey: 'embraceSunset',
        photoCaption: 'Golden hour highlight',
      },
      {
        id: 'par-m4',
        slot: 'morning',
        slotLabel: 'Slow start',
        time: '10:00 AM',
        title: 'Booksellers along the Seine',
        description:
          'The bouquinistes open their green boxes one by one. Buy each other a second-hand book neither of you would have picked alone.',
        cost: 18,
        styles: ['culture', 'relaxing', 'surprise'],
        photoKey: 'market',
      },
      {
        id: 'par-m5',
        slot: 'afternoon',
        slotLabel: 'Afternoon',
        time: '01:30 PM',
        title: 'Long lunch in Le Marais',
        description:
          'Falafel from the queue everyone swears by, eaten on a step in the sun, followed by pistachio ice cream you did not plan on.',
        cost: 32,
        styles: ['foodie', 'culture'],
        photoKey: 'coffeeToast',
      },
      {
        id: 'par-m6',
        slot: 'evening',
        slotLabel: 'Evening',
        time: '08:00 PM',
        title: 'Rooftop wine above the rooftops',
        description:
          'Zinc roofs turning blue, a shared carafe, and the city getting quieter below you than you expected it to.',
        cost: 46,
        styles: ['romantic', 'foodie'],
        photoKey: 'heartLights',
      },
      {
        id: 'par-m7',
        slot: 'morning',
        slotLabel: 'Early',
        time: '07:15 AM',
        title: 'The city before it wakes',
        description:
          'Pont Alexandre III with nobody on it. Cold hands, empty bridge, the best photograph either of you will take all year.',
        cost: 0,
        costLabel: 'Free',
        styles: ['adventure', 'romantic', 'surprise'],
        photoKey: 'parisDay',
        photoCaption: 'Worth the alarm',
      },
      {
        id: 'par-m8',
        slot: 'afternoon',
        slotLabel: 'Afternoon',
        time: '03:00 PM',
        title: 'An hour in a very small museum',
        description:
          'Skip the queues entirely. One room, one painter, and a bench you can sit on until you have actually looked at something.',
        cost: 22,
        styles: ['culture'],
        photoKey: null,
      },
      {
        id: 'par-m9',
        slot: 'evening',
        slotLabel: 'Night',
        time: '10:00 PM',
        title: 'Walk home the long way',
        description:
          'No taxi. Follow the river until one of you admits your feet hurt, then keep going one more bridge.',
        cost: 0,
        costLabel: 'Free',
        styles: ['relaxing', 'romantic', 'nature'],
        photoKey: 'cyclistsSunset',
      },
    ],
  },
  {
    name: 'Kyoto, Japan',
    aliases: ['kyoto', 'japan', 'tokyo'],
    country: 'Japan',
    tagline: 'Quiet and golden in autumn',
    currency: '£',
    coverKey: 'coastPalm',
    dayTitles: ['Arriving slowly', 'Temples & tea', 'Hills and water', 'One last morning'],
    moments: [
      {
        id: 'kyo-m1',
        slot: 'morning',
        slotLabel: 'Early',
        time: '06:45 AM',
        title: 'Fushimi Inari before the crowds',
        description:
          'Ten thousand gates and, for the first hour, almost nobody in them. Climb until the city appears through the trees.',
        cost: 0,
        costLabel: 'Free',
        styles: ['adventure', 'culture', 'nature'],
        photoKey: 'coastPalm',
        photoCaption: 'Go at sunrise or not at all',
      },
      {
        id: 'kyo-m2',
        slot: 'afternoon',
        slotLabel: 'Afternoon',
        time: '01:00 PM',
        title: 'Tea, properly, with someone who cares',
        description:
          'A small tatami room in Gion. Forty minutes, two bowls, and the first silence of the trip that neither of you needs to fill.',
        cost: 38,
        styles: ['culture', 'relaxing', 'romantic'],
        photoKey: 'coffeeTable',
      },
      {
        id: 'kyo-m3',
        slot: 'evening',
        slotLabel: 'Evening',
        time: '07:00 PM',
        title: 'Pontochō alley, lantern by lantern',
        description:
          'One narrow lane along the river, lit end to end. Pick the place with six seats and no English menu.',
        cost: 54,
        styles: ['foodie', 'romantic', 'surprise'],
        photoKey: 'heartLights',
        photoCaption: 'Six seats, no menu',
      },
      {
        id: 'kyo-m4',
        slot: 'morning',
        slotLabel: 'Morning',
        time: '09:30 AM',
        title: 'The bamboo grove, walking slowly',
        description:
          'Arashiyama early enough that you can hear it. Bamboo knocking together sounds nothing like you imagine it will.',
        cost: 0,
        costLabel: 'Free',
        styles: ['nature', 'relaxing'],
        photoKey: 'cyclistsSunset',
      },
      {
        id: 'kyo-m5',
        slot: 'afternoon',
        slotLabel: 'Afternoon',
        time: '02:30 PM',
        title: 'Nishiki market, one bite at a time',
        description:
          'Five blocks, no plan, share everything. Stop when one of you cannot identify what you are eating and eat it anyway.',
        cost: 28,
        styles: ['foodie', 'adventure', 'surprise'],
        photoKey: 'market',
      },
      {
        id: 'kyo-m6',
        slot: 'evening',
        slotLabel: 'Sunset moment',
        time: '05:30 PM',
        title: 'Kiyomizu-dera as the light goes',
        description:
          'The wooden stage out over the hillside, the whole valley turning orange, and the bell somewhere behind you.',
        cost: 12,
        styles: ['culture', 'romantic', 'nature'],
        photoKey: 'coastSunset',
        photoCaption: 'Stay until it is properly dark',
      },
      {
        id: 'kyo-m7',
        slot: 'morning',
        slotLabel: 'Slow start',
        time: '10:30 AM',
        title: 'A bath, a book, and nowhere to be',
        description:
          'The trip needs one morning that is not a list. This is it.',
        cost: 20,
        styles: ['relaxing'],
        photoKey: null,
      },
      {
        id: 'kyo-m8',
        slot: 'afternoon',
        slotLabel: 'Afternoon',
        time: '03:00 PM',
        title: 'Cycle the Kamo riverbank',
        description:
          'Rent two bad bicycles. Ride until the herons outnumber the people, then turn around.',
        cost: 16,
        styles: ['adventure', 'nature'],
        photoKey: 'cyclistsSunset',
      },
      {
        id: 'kyo-m9',
        slot: 'evening',
        slotLabel: 'Night',
        time: '09:00 PM',
        title: 'Convenience-store dinner on the floor',
        description:
          'Deeply unromantic and somehow the meal you will both bring up for years.',
        cost: 9,
        styles: ['surprise', 'relaxing'],
        photoKey: null,
      },
    ],
  },
  {
    name: 'Amalfi Coast, Italy',
    aliases: ['amalfi', 'italy', 'positano', 'rome'],
    country: 'Italy',
    tagline: 'Lemons, cliffs and long lunches',
    currency: '€',
    coverKey: 'coastSunset',
    dayTitles: ['Down to the water', 'Cliffs and lemons', 'Boats and nothing', 'Slow goodbye'],
    moments: [
      {
        id: 'ama-m1',
        slot: 'morning',
        slotLabel: 'Morning',
        time: '08:30 AM',
        title: 'Coffee standing up, like a local',
        description:
          'Espresso at the bar for a euro, drunk in ninety seconds, followed by a second one because you are on holiday.',
        cost: 6,
        styles: ['foodie', 'relaxing'],
        photoKey: 'coffeeTable',
      },
      {
        id: 'ama-m2',
        slot: 'afternoon',
        slotLabel: 'Afternoon',
        time: '12:30 PM',
        title: 'The Path of the Gods',
        description:
          'Two hours along the cliff with the whole coast underneath you. Start early, carry water, stop often.',
        cost: 0,
        costLabel: 'Free',
        styles: ['adventure', 'nature'],
        photoKey: 'coastPalm',
        photoCaption: 'Sturdy shoes, not sandals',
      },
      {
        id: 'ama-m3',
        slot: 'evening',
        slotLabel: 'Sunset moment',
        time: '07:45 PM',
        title: 'Dinner where the sea is the noise',
        description:
          'A terrace in Praiano, lemon pasta, and the light going pink over the water while neither of you says much.',
        cost: 64,
        styles: ['romantic', 'foodie'],
        photoKey: 'coastSunset',
      },
      {
        id: 'ama-m4',
        slot: 'morning',
        slotLabel: 'Early',
        time: '07:00 AM',
        title: 'Swim before anyone else is up',
        description:
          'The water is cold for ninety seconds and perfect after that. The beach is yours until nine.',
        cost: 0,
        costLabel: 'Free',
        styles: ['adventure', 'nature', 'romantic'],
        photoKey: 'coastPalm',
      },
      {
        id: 'ama-m5',
        slot: 'afternoon',
        slotLabel: 'Afternoon',
        time: '02:00 PM',
        title: 'A boat, a bay, no schedule',
        description:
          'Hire something small. Anchor somewhere with nobody in it. Swim off the back and eat what you brought.',
        cost: 90,
        styles: ['adventure', 'romantic', 'surprise'],
        photoKey: 'coastSunset',
        photoCaption: 'Split it and it is worth it',
      },
      {
        id: 'ama-m6',
        slot: 'evening',
        slotLabel: 'Evening',
        time: '08:30 PM',
        title: 'Lemon granita on the steps',
        description:
          'Six hundred steps down to the square, granita at the bottom, and absolutely no plan for getting back up.',
        cost: 8,
        styles: ['relaxing', 'foodie', 'surprise'],
        photoKey: 'market',
      },
      {
        id: 'ama-m7',
        slot: 'morning',
        slotLabel: 'Morning',
        time: '10:00 AM',
        title: 'The lemon terraces above town',
        description:
          'Someone has farmed this cliff by hand for four hundred years. You can taste the difference and you will be told so.',
        cost: 22,
        styles: ['culture', 'foodie', 'nature'],
        photoKey: 'flowers',
      },
      {
        id: 'ama-m8',
        slot: 'afternoon',
        slotLabel: 'Afternoon',
        time: '04:00 PM',
        title: 'Ravello, for the gardens and the view',
        description:
          'Up the hill away from the coast road. The terrace at Villa Cimbrone is the photograph everyone has seen and it is still worth it.',
        cost: 20,
        styles: ['culture', 'romantic', 'nature'],
        photoKey: 'flowers',
      },
      {
        id: 'ama-m9',
        slot: 'evening',
        slotLabel: 'Night',
        time: '10:00 PM',
        title: 'Limoncello you did not order',
        description:
          'It arrives anyway, in tiny frozen glasses, and refusing it would be rude.',
        cost: 0,
        costLabel: 'On the house',
        styles: ['foodie', 'surprise'],
        photoKey: null,
      },
    ],
  },
  {
    name: 'Lisbon, Portugal',
    aliases: ['lisbon', 'portugal', 'lisboa'],
    country: 'Portugal',
    tagline: 'Tiles, hills and cheap wine',
    currency: '€',
    coverKey: 'santorini',
    dayTitles: ['Uphill both ways', 'Tiles and trams', 'Out to the water', 'One more pastel'],
    moments: [
      {
        id: 'lis-m1',
        slot: 'morning',
        slotLabel: 'Morning',
        time: '09:00 AM',
        title: 'Pastéis de nata, still warm',
        description:
          'Two each, cinnamon on top, eaten standing at the counter before they have cooled enough to be sensible.',
        cost: 7,
        styles: ['foodie', 'relaxing'],
        photoKey: 'coffeeToast',
      },
      {
        id: 'lis-m2',
        slot: 'afternoon',
        slotLabel: 'Afternoon',
        time: '01:00 PM',
        title: 'Get lost in Alfama on purpose',
        description:
          'No map. Every street goes up or down and none of them go where you think. You will find the same tiled wall three times.',
        cost: 0,
        costLabel: 'Free',
        styles: ['culture', 'adventure', 'surprise'],
        photoKey: 'santorini',
        photoCaption: 'Wear the flat shoes',
      },
      {
        id: 'lis-m3',
        slot: 'evening',
        slotLabel: 'Sunset moment',
        time: '07:00 PM',
        title: 'A miradouro, a bottle, the whole city',
        description:
          'Buy wine from the kiosk, sit on the wall at Senhora do Monte, and watch the roofs turn the colour of the roofs.',
        cost: 12,
        styles: ['romantic', 'relaxing'],
        photoKey: 'coastSunset',
      },
      {
        id: 'lis-m4',
        slot: 'morning',
        slotLabel: 'Slow start',
        time: '10:30 AM',
        title: 'The 28 tram, all the way',
        description:
          'Get on at the start so you actually get a seat. It rattles through half the city and costs almost nothing.',
        cost: 6,
        styles: ['culture', 'relaxing'],
        photoKey: null,
      },
      {
        id: 'lis-m5',
        slot: 'afternoon',
        slotLabel: 'Afternoon',
        time: '02:30 PM',
        title: 'Time Out Market, disagree about lunch',
        description:
          'Thirty kitchens under one roof. Split up, buy the thing you each want, meet back and argue about who chose better.',
        cost: 34,
        styles: ['foodie', 'surprise'],
        photoKey: 'market',
      },
      {
        id: 'lis-m6',
        slot: 'evening',
        slotLabel: 'Evening',
        time: '09:30 PM',
        title: 'Fado in a room with twenty chairs',
        description:
          'No photographs, no talking, and someone singing about missing a place while standing in it.',
        cost: 40,
        styles: ['culture', 'romantic'],
        photoKey: 'heartLights',
      },
      {
        id: 'lis-m7',
        slot: 'morning',
        slotLabel: 'Early',
        time: '08:00 AM',
        title: 'Train to the coast',
        description:
          'Forty minutes along the water to Cascais. Sit on the left. Bring the pastries from yesterday.',
        cost: 9,
        styles: ['adventure', 'nature', 'relaxing'],
        photoKey: 'coastPalm',
      },
      {
        id: 'lis-m8',
        slot: 'afternoon',
        slotLabel: 'Afternoon',
        time: '03:30 PM',
        title: 'Sintra, if you can face the hill',
        description:
          'Absurd palaces in absurd colours in a forest that is usually in cloud. Go late, when the coaches have left.',
        cost: 30,
        styles: ['culture', 'nature', 'adventure'],
        photoKey: 'flowers',
      },
      {
        id: 'lis-m9',
        slot: 'evening',
        slotLabel: 'Night',
        time: '11:00 PM',
        title: 'Ginjinha, one each, standing up',
        description:
          'Sour cherry liqueur in a chocolate cup from a shop the size of a cupboard. One is correct. Two is a decision.',
        cost: 5,
        styles: ['surprise', 'foodie'],
        photoKey: null,
      },
    ],
  },
  {
    name: 'Reykjavík, Iceland',
    aliases: ['reykjavik', 'iceland', 'norway', 'tromso'],
    country: 'Iceland',
    tagline: 'Cold air, long nights, green sky',
    currency: '£',
    coverKey: 'heartLights',
    dayTitles: ['Into the cold', 'Water and steam', 'Chasing the light', 'Home the long way'],
    moments: [
      {
        id: 'rey-m1',
        slot: 'morning',
        slotLabel: 'Morning',
        time: '10:00 AM',
        title: 'Cinnamon buns and terrible weather',
        description:
          'The sun comes up at eleven in winter. Sit by a window with coffee until it does.',
        cost: 14,
        styles: ['relaxing', 'foodie'],
        photoKey: 'coffeeRain',
      },
      {
        id: 'rey-m2',
        slot: 'afternoon',
        slotLabel: 'Afternoon',
        time: '01:00 PM',
        title: 'A thermal pool in the snow',
        description:
          'Thirty-eight degrees of water, two degrees of air, and steam thick enough that you lose each other in it.',
        cost: 30,
        styles: ['relaxing', 'romantic', 'nature'],
        photoKey: 'coastPalm',
        photoCaption: 'Locals go every day',
      },
      {
        id: 'rey-m3',
        slot: 'evening',
        slotLabel: 'Night',
        time: '10:30 PM',
        title: 'Drive out until the sky does something',
        description:
          'Away from every light, engine off, hoping. Some nights nothing happens. Some nights the whole sky moves.',
        cost: 0,
        costLabel: 'Free · and worth everything',
        styles: ['adventure', 'romantic', 'nature'],
        photoKey: 'heartLights',
        photoCaption: 'Check the forecast at 6pm',
      },
      {
        id: 'rey-m4',
        slot: 'morning',
        slotLabel: 'Early',
        time: '08:30 AM',
        title: 'Black sand, grey sea, no one',
        description:
          'Reynisfjara before the tour buses. Do not turn your back on the water — this is a real instruction, not atmosphere.',
        cost: 0,
        costLabel: 'Free',
        styles: ['nature', 'adventure'],
        photoKey: 'coastSunset',
      },
      {
        id: 'rey-m5',
        slot: 'afternoon',
        slotLabel: 'Afternoon',
        time: '02:00 PM',
        title: 'Walk behind a waterfall',
        description:
          'Seljalandsfoss. You will get soaked, the path is slippery, and you will both do it twice.',
        cost: 8,
        styles: ['adventure', 'nature'],
        photoKey: 'coastPalm',
      },
      {
        id: 'rey-m6',
        slot: 'evening',
        slotLabel: 'Evening',
        time: '07:30 PM',
        title: 'Lamb soup and a very long menu of nothing else',
        description:
          'A small room, one good thing, endless bread. Exactly right after a day outside.',
        cost: 36,
        styles: ['foodie', 'relaxing'],
        photoKey: 'cookingTogether',
      },
      {
        id: 'rey-m7',
        slot: 'morning',
        slotLabel: 'Morning',
        time: '11:00 AM',
        title: 'The concert hall, for the glass',
        description:
          'Harpa does something with light that photographs badly and looks extraordinary in person.',
        cost: 0,
        costLabel: 'Free to wander',
        styles: ['culture'],
        photoKey: null,
      },
      {
        id: 'rey-m8',
        slot: 'afternoon',
        slotLabel: 'Afternoon',
        time: '03:00 PM',
        title: 'Horses, small and extremely smug',
        description:
          'An hour on an Icelandic horse across country that looks like somewhere else entirely.',
        cost: 75,
        styles: ['adventure', 'nature', 'surprise'],
        photoKey: 'cyclistsSunset',
      },
      {
        id: 'rey-m9',
        slot: 'evening',
        slotLabel: 'Night',
        time: '09:00 PM',
        title: 'Hot dog from the stand by the harbour',
        description:
          'One with everything, each. Famous for good reason, costs nothing, eaten in the wind.',
        cost: 7,
        styles: ['foodie', 'surprise'],
        photoKey: null,
      },
    ],
  },
]
