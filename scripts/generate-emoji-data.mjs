import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { XMLParser } from 'fast-xml-parser';

const CLDR_ROOT = '/usr/share/unicode/cldr/common/annotations';
const outputPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src/data/emoji.ts');
const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '', textNodeName: 'text' });

function annotations(language) {
  const source = fs.readFileSync(path.join(CLDR_ROOT, `${language}.xml`), 'utf8');
  const entries = parser.parse(source).ldml.annotations.annotation;
  const result = new Map();
  for (const entry of entries) {
    if (!entry.cp || typeof entry.text !== 'string') continue;
    const current = result.get(entry.cp) ?? { name: '', keywords: '' };
    if (entry.type === 'tts') current.name = entry.text;
    else current.keywords = entry.text;
    result.set(entry.cp, current);
  }
  return result;
}

const isEmoji = (value) => /\p{Extended_Pictographic}/u.test(value)
  || /\p{Regional_Indicator}/u.test(value)
  || value.includes('\u20e3');

function emojiPresentation(value) {
  if (value.includes('\u20e3')) return value.replace(/([#*0-9])\u20e3/u, '$1\ufe0f\u20e3');
  const codePoints = [...value];
  if (codePoints.length === 1
    && /\p{Extended_Pictographic}/u.test(value)
    && !/\p{Emoji_Presentation}/u.test(value)) return `${value}\ufe0f`;
  return value;
}

function matches(text, words) {
  return new RegExp(`\\b(?:${words})\\b`, 'i').test(text);
}

function classify(text, char) {
  if (matches(text, 'face|smil(?:e|ing)|grin|laugh|joy|tear|cry|angry|fear|anxious|worried|sad|kiss|emotion|scream|frown|blush|halo|nauseated|vomit|sneeze|sleep|dizzy|drool|tongue|sunglasses|disguise|monocle|clown|poop|devil|ogre|ghost|alien|robot')) return 'smileys';
  if (matches(text, 'hand|finger|thumb|clap|wave|gesture|person|people|man|woman|boy|girl|child|baby|adult|family|couple|bust|ear|nose|eye|mouth|lip|tooth|bone|leg|foot|brain|heart organ|lungs|hair|beard|pregnant|kneel|stand|walk|run|dance|speak|deaf|massage|haircut|bath|bed|sauna|superhero|supervillain|mage|fairy|vampire|merperson|elf|genie|zombie|troll|guard|detective|ninja|prince|princess|bride|groom|santa|profession|worker|student|teacher|judge|farmer|cook|mechanic|factory|office|scientist|technologist|singer|artist|pilot|astronaut|firefighter')) return 'gestures';
  if (matches(text, 'food|drink|fruit|vegetable|apple|pear|orange|lemon|banana|watermelon|grape|strawberry|melon|cherr|peach|mango|pineapple|coconut|kiwi|tomato|olive|avocado|eggplant|potato|carrot|corn|pepper|cucumber|broccoli|garlic|onion|peanut|bean|chestnut|ginger|pea pod|bread|croissant|baguette|pretzel|bagel|pancake|waffle|cheese|meat|poultry|bacon|hamburger|fries|pizza|sandwich|taco|burrito|tamale|falafel|egg|cooking|stew|fondue|bowl|salad|popcorn|butter|salt|canned|bento|rice|curry|ramen|spaghetti|sweet potato|oden|sushi|shrimp|fish cake|moon cake|dango|dumpling|fortune cookie|takeout|oyster|ice cream|doughnut|cookie|cake|shortcake|cupcake|pie|chocolate|candy|lollipop|custard|honey|milk|coffee|tea|sake|champagne|wine|cocktail|beer|beverage|juice|mate|ice|chopsticks|fork and knife|spoon')) return 'food';
  if (matches(text, 'animal|mammal|bird|insect|dog|cat|mouse|hamster|rabbit|fox|bear|panda|koala|tiger|lion|cow|pig|frog|monkey|chicken|penguin|chick|duck|eagle|owl|bat|wolf|boar|horse|unicorn|bee|worm|butterfly|snail|beetle|ant|fly|mosquito|cockroach|spider|scorpion|turtle|snake|lizard|dinosaur|octopus|squid|lobster|crab|fish|dolphin|whale|shark|seal|crocodile|leopard|zebra|gorilla|orangutan|elephant|mammoth|hippo|rhino|camel|giraffe|kangaroo|bison|buffalo|ox|deer|goat|llama|sloth|otter|skunk|badger|beaver|hedgehog|paw|dragon|coral|jellyfish|plant|tree|flower|blossom|leaf|herb|mushroom|cactus|seedling|sheaf|earth|globe|moon|sun|cloud|rain|snow|thunder|tornado|fog|rainbow|weather|comet')) return 'nature';
  if (matches(text, 'transport|vehicle|car|taxi|bus|trolley|racing|police car|ambulance|fire engine|minibus|truck|tractor|scooter|wheelchair|bicycle|motorcycle|railway|train|metro|tram|station|airplane|flight|parachute|helicopter|rocket|satellite|saucer|canoe|boat|ship|ferry|anchor|fuel|construction|map|compass|mountain|volcano|camping|beach|desert|island|park|stadium|building|house|home|office|hospital|bank|hotel|school|factory|castle|temple|church|mosque|synagogue|shinto|kaaba|fountain|tent|city|sunrise|sunset|bridge|carousel|playground|ferris|roller coaster|barber pole|circus|locomotive|flag')) return 'travel';
  if (matches(text, 'sport|ball|soccer|football|baseball|softball|basketball|volleyball|rugby|tennis|disc|bowling|cricket|field hockey|ice hockey|lacrosse|ping pong|badminton|boxing|martial|goal|golf|skate|fishing|diving|ski|sled|curling|target|yo-yo|kite|pool 8|crystal ball|magic wand|game|joystick|slot machine|dice|puzzle|teddy|pinata|mirror ball|playing card|mahjong|joker|performing arts|art|palette|thread|yarn|sewing|music|musical|guitar|violin|piano|drum|saxophone|trumpet|flute|accordion|banjo|microphone|headphone|radio|medal|trophy|award|ticket')) return 'activities';
  if (/\p{Regional_Indicator}/u.test(char) || char.includes('\u20e3')
    || matches(text, 'symbol|sign|mark|button|arrow|zodiac|warning|prohibited|check|cross|question|exclamation|heart|sparkle|star|fire|collision|anger|speech balloon|thought balloon|clock|number|letter|currency|copyright|registered|trademark|geometric|circle|square|diamond|triangle|religion|atom|peace|yin yang|recycling|infinity|gender')) return 'symbols';
  return 'objects';
}

const en = annotations('en');
const zh = annotations('zh');
const records = [];
for (const [char, english] of en) {
  const chinese = zh.get(char);
  if (!isEmoji(char) || !english.name || !chinese?.name) continue;
  const searchEn = `${english.name} ${english.keywords}`.toLowerCase();
  const searchZh = `${chinese.name} ${chinese.keywords}`;
  records.push({
    char: emojiPresentation(char),
    nameEn: english.name,
    nameZh: chinese.name,
    searchEn,
    searchZh,
    group: classify(searchEn, char),
  });
}

const groupOrder = ['smileys', 'gestures', 'symbols', 'objects', 'nature', 'food', 'travel', 'activities'];
records.sort((a, b) => groupOrder.indexOf(a.group) - groupOrder.indexOf(b.group)
  || a.char.codePointAt(0) - b.char.codePointAt(0));

const chunks = [];
for (let index = 0; index < records.length; index += 100) chunks.push(records.slice(index, index + 100));
const chunkDeclarations = chunks
  .map((chunk, index) => `const emojiDataPart${index}: EmojiEntry[] = ${JSON.stringify(chunk, null, 2)};`)
  .join('\n\n');
const chunkNames = chunks.map((_, index) => `emojiDataPart${index}`).join(', ');

const output = `/**
 * Generated from Unicode CLDR annotations (Unicode License v3).
 * Run: node scripts/generate-emoji-data.mjs
 */

export type EmojiGroupKey = 'smileys' | 'gestures' | 'symbols' | 'objects' | 'nature' | 'food' | 'travel' | 'activities';

export interface EmojiEntry {
  char: string;
  nameEn: string;
  nameZh: string;
  searchEn: string;
  searchZh: string;
  group: EmojiGroupKey;
}

${chunkDeclarations}

export const emojiData: EmojiEntry[] = ([] as EmojiEntry[]).concat(${chunkNames});
`;

fs.writeFileSync(outputPath, output);
console.log(`Generated ${records.length} bilingual emoji entries at ${outputPath}`);
