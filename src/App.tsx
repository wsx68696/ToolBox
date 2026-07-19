import { createContext, useCallback, useContext, useMemo } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import AuroraBackground from './components/AuroraBackground';
import AppShell from './components/AppShell';
import ToolGrid from './components/ToolGrid';
import { useLocalStorage } from './hooks/useLocalStorage';
import Base64Tool from './tools/base64';
import JsonTool from './tools/json';
import JwtTool from './tools/jwt';
import UuidTool from './tools/uuid';
import HashTool from './tools/hash';
import UrlTool from './tools/url';
import ColorTool from './tools/color';
import RegexTool from './tools/regex';
import PasswordTool from './tools/password';
import TimestampTool from './tools/timestamp';
import QrCodeTool from './tools/qrcode';
import HtmlEntityTool from './tools/html-entity';
import NumberBaseTool from './tools/number-base';
import RomanNumeralTool from './tools/roman-numeral';
import TextStatsTool from './tools/text-stats';
import CaseConverterTool from './tools/case-converter';
import LoremIpsumTool from './tools/lorem-ipsum';
import SlugifyTool from './tools/slugify';
import ListTools from './tools/list-tools';
import MacAddressTool from './tools/mac-address';
import Ipv4SubnetTool from './tools/ipv4-subnet';
import RandomPortTool from './tools/random-port';
import HttpStatusTool from './tools/http-status';
import MimeTypesTool from './tools/mime-types';
import BasicAuthTool from './tools/basic-auth';
import ChmodCalculatorTool from './tools/chmod-calculator';
import CrontabParserTool from './tools/crontab-parser';
import TotpTool from './tools/totp';
import HmacTool from './tools/hmac';
import RsaKeyTool from './tools/rsa-key';
import XmlFormatTool from './tools/xml-format';
import JsonCsvTool from './tools/json-csv';
import UrlParserTool from './tools/url-parser';
import UlidTool from './tools/ulid';
import TemperatureTool from './tools/temperature';
import NatoAlphabetTool from './tools/nato-alphabet';
import TextBinaryTool from './tools/text-binary';
import KeycodeTool from './tools/keycode';
import DeviceInfoTool from './tools/device-info';
import TextDiffTool from './tools/text-diff';
import MathEvaluatorTool from './tools/math-evaluator';
import PercentageCalculatorTool from './tools/percentage-calculator';
import StringObfuscatorTool from './tools/string-obfuscator';
import TextUnicodeTool from './tools/text-unicode';
import WifiQrcodeTool from './tools/wifi-qrcode';
import SvgPlaceholderTool from './tools/svg-placeholder';
import RegexCheatsheetTool from './tools/regex-cheatsheet';
import Ipv4ConverterTool from './tools/ipv4-converter';
import Ipv4RangeTool from './tools/ipv4-range';
import IbanValidatorTool from './tools/iban-validator';
import UserAgentTool from './tools/user-agent';
import EmailNormalizerTool from './tools/email-normalizer';
import NumeronymTool from './tools/numeronym';
import MetaTagsTool from './tools/meta-tags';
import JsonDiffTool from './tools/json-diff';
import YamlJsonTool from './tools/yaml-json';
import TomlJsonTool from './tools/toml-json';
import SqlFormatTool from './tools/sql-format';
import MarkdownPreviewTool from './tools/markdown-preview';
import BcryptTool from './tools/bcrypt';
import EmojiPickerTool from './tools/emoji-picker';
import JsonMinifyTool from './tools/json-minify';
import XmlJsonTool from './tools/xml-json';
import DateConverterTool from './tools/date-converter';
import IPv6UlaTool from './tools/ipv6-ula';
import PhoneParserTool from './tools/phone-parser';
import AsciiArtTool from './tools/ascii-art';
import YamlTomlTool from './tools/yaml-toml';
import TokenGeneratorTool from './tools/token-generator';
import EncryptionTool from './tools/encryption';
import PasswordStrengthTool from './tools/password-strength';
import EtaCalculatorTool from './tools/eta-calculator';
import ChronometerTool from './tools/chronometer';
import Base64FileTool from './tools/base64-file';
import SafelinkDecoderTool from './tools/safelink-decoder';
import DockerComposeTool from './tools/docker-compose';
import GitMemoTool from './tools/git-memo';
import YamlViewerTool from './tools/yaml-viewer';
import BenchmarkBuilderTool from './tools/benchmark-builder';
import CameraRecorderTool from './tools/camera-recorder';
import HtmlWysiwygTool from './tools/html-wysiwyg';
import PdfSignatureCheckerTool from './tools/pdf-signature-checker';
import MacAddressLookupTool from './tools/mac-address-lookup';
import Bip39GeneratorTool from './tools/bip39-generator';
import CyberchefTool from './tools/cyberchef';


interface RecentContextValue {
  recent: string[];
  markRecent: (id: string) => void;
}

const RecentContext = createContext<RecentContextValue | null>(null);

export function useRecentTools() {
  const context = useContext(RecentContext);
  if (!context) throw new Error('useRecentTools must be used inside RecentContext');
  return context;
}

export default function App() {
  const [recent, setRecent] = useLocalStorage<string[]>('toolbox:recent', []);
  const markRecent = useCallback((id: string) => {
    setRecent((current) => [id, ...current.filter((item) => item !== id)].slice(0, 3));
  }, [setRecent]);
  const value = useMemo(() => ({ recent, markRecent }), [recent, markRecent]);

  return (
    <RecentContext.Provider value={value}>
      <AppShell>
        <AuroraBackground />
        <Routes>
          <Route path="/" element={<ToolGrid />} />
          <Route path="/tool/base64" element={<Base64Tool />} />
          <Route path="/tool/json" element={<JsonTool />} />
          <Route path="/tool/jwt" element={<JwtTool />} />
          <Route path="/tool/uuid" element={<UuidTool />} />
          <Route path="/tool/hash" element={<HashTool />} />
          <Route path="/tool/url" element={<UrlTool />} />
          <Route path="/tool/color" element={<ColorTool />} />
          <Route path="/tool/regex" element={<RegexTool />} />
          <Route path="/tool/password" element={<PasswordTool />} />
          <Route path="/tool/timestamp" element={<TimestampTool />} />
          <Route path="/tool/qrcode" element={<QrCodeTool />} />
          <Route path="/tool/html-entity" element={<HtmlEntityTool />} />
          <Route path="/tool/number-base" element={<NumberBaseTool />} />
          <Route path="/tool/roman-numeral" element={<RomanNumeralTool />} />
          <Route path="/tool/text-stats" element={<TextStatsTool />} />
          <Route path="/tool/case-converter" element={<CaseConverterTool />} />
          <Route path="/tool/lorem-ipsum" element={<LoremIpsumTool />} />
          <Route path="/tool/slugify" element={<SlugifyTool />} />
          <Route path="/tool/list-tools" element={<ListTools />} />
          <Route path="/tool/mac-address" element={<MacAddressTool />} />
          <Route path="/tool/ipv4-subnet" element={<Ipv4SubnetTool />} />
          <Route path="/tool/random-port" element={<RandomPortTool />} />
          <Route path="/tool/http-status" element={<HttpStatusTool />} />
          <Route path="/tool/mime-types" element={<MimeTypesTool />} />
          <Route path="/tool/basic-auth" element={<BasicAuthTool />} />
          <Route path="/tool/chmod-calculator" element={<ChmodCalculatorTool />} />
          <Route path="/tool/crontab-parser" element={<CrontabParserTool />} />
          <Route path="/tool/totp" element={<TotpTool />} />
          <Route path="/tool/hmac" element={<HmacTool />} />
          <Route path="/tool/rsa-key" element={<RsaKeyTool />} />
          <Route path="/tool/xml-format" element={<XmlFormatTool />} />
          <Route path="/tool/json-csv" element={<JsonCsvTool />} />
          <Route path="/tool/url-parser" element={<UrlParserTool />} />
          <Route path="/tool/ulid" element={<UlidTool />} />
          <Route path="/tool/temperature" element={<TemperatureTool />} />
          <Route path="/tool/nato-alphabet" element={<NatoAlphabetTool />} />
          <Route path="/tool/text-binary" element={<TextBinaryTool />} />
          <Route path="/tool/keycode" element={<KeycodeTool />} />
          <Route path="/tool/device-info" element={<DeviceInfoTool />} />
          <Route path="/tool/text-diff" element={<TextDiffTool />} />
          <Route path="/tool/math-evaluator" element={<MathEvaluatorTool />} />
          <Route path="/tool/percentage-calculator" element={<PercentageCalculatorTool />} />
          <Route path="/tool/string-obfuscator" element={<StringObfuscatorTool />} />
          <Route path="/tool/text-unicode" element={<TextUnicodeTool />} />
          <Route path="/tool/wifi-qrcode" element={<WifiQrcodeTool />} />
          <Route path="/tool/svg-placeholder" element={<SvgPlaceholderTool />} />
          <Route path="/tool/regex-cheatsheet" element={<RegexCheatsheetTool />} />
          <Route path="/tool/ipv4-converter" element={<Ipv4ConverterTool />} />
          <Route path="/tool/ipv4-range" element={<Ipv4RangeTool />} />
          <Route path="/tool/iban-validator" element={<IbanValidatorTool />} />
          <Route path="/tool/user-agent" element={<UserAgentTool />} />
          <Route path="/tool/email-normalizer" element={<EmailNormalizerTool />} />
          <Route path="/tool/numeronym" element={<NumeronymTool />} />
          <Route path="/tool/meta-tags" element={<MetaTagsTool />} />
          <Route path="/tool/json-diff" element={<JsonDiffTool />} />
          <Route path="/tool/json-minify" element={<JsonMinifyTool />} />
          <Route path="/tool/xml-json" element={<XmlJsonTool />} />
          <Route path="/tool/yaml-json" element={<YamlJsonTool />} />
          <Route path="/tool/toml-json" element={<TomlJsonTool />} />
          <Route path="/tool/sql-format" element={<SqlFormatTool />} />
          <Route path="/tool/markdown-preview" element={<MarkdownPreviewTool />} />
          <Route path="/tool/bcrypt" element={<BcryptTool />} />
          <Route path="/tool/emoji-picker" element={<EmojiPickerTool />} />
          <Route path="/tool/date-converter" element={<DateConverterTool />} />
          <Route path="/tool/ipv6-ula" element={<IPv6UlaTool />} />
          <Route path="/tool/phone-parser" element={<PhoneParserTool />} />
          <Route path="/tool/ascii-art" element={<AsciiArtTool />} />
          <Route path="/tool/yaml-toml" element={<YamlTomlTool />} />
          <Route path="/tool/token-generator" element={<TokenGeneratorTool />} />
          <Route path="/tool/encryption" element={<EncryptionTool />} />
          <Route path="/tool/password-strength" element={<PasswordStrengthTool />} />
          <Route path="/tool/eta-calculator" element={<EtaCalculatorTool />} />
          <Route path="/tool/chronometer" element={<ChronometerTool />} />
          <Route path="/tool/base64-file" element={<Base64FileTool />} />
          <Route path="/tool/safelink-decoder" element={<SafelinkDecoderTool />} />
          <Route path="/tool/docker-compose" element={<DockerComposeTool />} />
          <Route path="/tool/git-memo" element={<GitMemoTool />} />
          <Route path="/tool/yaml-viewer" element={<YamlViewerTool />} />
          <Route path="/tool/benchmark-builder" element={<BenchmarkBuilderTool />} />
          <Route path="/tool/camera-recorder" element={<CameraRecorderTool />} />
          <Route path="/tool/html-wysiwyg" element={<HtmlWysiwygTool />} />
          <Route path="/tool/pdf-signature-checker" element={<PdfSignatureCheckerTool />} />
          <Route path="/tool/mac-address-lookup" element={<MacAddressLookupTool />} />
          <Route path="/tool/bip39-generator" element={<Bip39GeneratorTool />} />
          <Route path="/tool/cyberchef" element={<CyberchefTool />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </RecentContext.Provider>
  );
}
