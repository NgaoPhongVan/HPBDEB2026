# Vietnamese web fonts

The website serves these fonts locally, so Vietnamese text does not depend on
fonts installed on a phone or on a separate Google Fonts request:

- Be Vietnam Pro, weights 300–700: body text and section headings.
- Patrick Hand, weight 400: timeline titles and photo captions.
- Roboto Mono, variable weights 100–700: the printed receipt.

Sources: the official [Google Fonts repository](https://github.com/google/fonts),
directories `ofl/bevietnampro`, `ofl/patrickhand`, and `ofl/robotomono`.
Their SIL Open Font Licenses are included in `licenses/`.

The WOFF files were created with FontTools from the upstream TTF files. They
retain Latin and Latin Extended (U+0020–024F), combining marks (U+0300–036F),
Latin Extended Additional including Vietnamese (U+1E00–1EFF), general punctuation
(U+2000–206F), and currency symbols (U+20A0–20CF), wherever present upstream.
OpenType layout and mark positioning tables are retained by FontTools.

MomoSignature remains the signature font: its existing TTF also contains the
complete precomposed Vietnamese alphabet. The old Cafe24Dongdong and Nighthawk
assets remain in the repository but are no longer used, because their missing
Vietnamese characters caused mixed fonts within words.
