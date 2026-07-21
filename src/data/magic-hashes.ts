export type MagicHashAlgorithm = 'MD5' | 'SHA-1' | 'SHA-224' | 'SHA-256';

export interface MagicHashEntry {
  algorithm: MagicHashAlgorithm;
  input: string;
  hash: string;
}

export const magicHashAlgorithms: MagicHashAlgorithm[] = ['MD5', 'SHA-1', 'SHA-224', 'SHA-256'];

export const magicHashes: MagicHashEntry[] = [
  { algorithm: 'MD5', input: '240610708', hash: '0e462097431906509019562988736854' },
  { algorithm: 'MD5', input: 'QNKCDZO', hash: '0e830400451993494058024219903391' },
  { algorithm: 'MD5', input: 'aabg7XSs', hash: '0e087386482136013740957780965295' },
  { algorithm: 'MD5', input: 'aabC9RqS', hash: '0e041022518165728065344349536299' },
  { algorithm: 'MD5', input: 's878926199a', hash: '0e545993274517709034328855841020' },
  { algorithm: 'MD5', input: 's155964671a', hash: '0e342768416822451524974117254469' },
  { algorithm: 'MD5', input: 's214587387a', hash: '0e848240448830537924465865611904' },
  { algorithm: 'MD5', input: 's1091221200a', hash: '0e940624217856561557816327384675' },
  { algorithm: 'MD5', input: 's1885207154a', hash: '0e509367213418206700842008763514' },
  { algorithm: 'MD5', input: 's1502113478a', hash: '0e861580163291561247404381396064' },
  { algorithm: 'MD5', input: 's1836677006a', hash: '0e481036490867661113260034900752' },
  { algorithm: 'MD5', input: 's1184209335a', hash: '0e072485820392773389523109082030' },
  { algorithm: 'MD5', input: 's1665632922a', hash: '0e731198061491163073197128363787' },
  { algorithm: 'SHA-1', input: '10932435112', hash: '0e07766915004133176347055865026311692244' },
  { algorithm: 'SHA-1', input: 'aaroZmOk', hash: '0e66507019969427134894567494305185566735' },
  { algorithm: 'SHA-1', input: 'aaK1STfY', hash: '0e76658526655756207688271159624026011393' },
  { algorithm: 'SHA-1', input: 'aaO8zKZF', hash: '0e89257456677279068558073954252716165668' },
  { algorithm: 'SHA-1', input: 'aa3OFF9m', hash: '0e36977786278517984959260394024281014729' },
  { algorithm: 'SHA-224', input: '10885164793773', hash: '0e281250946775200129471613219196999537878926740638594636' },
  { algorithm: 'SHA-256', input: '34250003024812', hash: '0e46289032038065916139621039085883773413820991920706299695051332' },
  { algorithm: 'SHA-256', input: 'TyNOQHUS', hash: '0e66298694359207596086558843543959518835691168370379069085300385' },
];
