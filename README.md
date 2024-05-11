# Translate sistrall.it contents

This repo contains an example of script, quite similar
to the one that I use in May 2024 to translate
sistrall.it contents from Italian to English, once the contents have been transferred to DatoCMS.

The scripts use DatoCMS to retrieve and store the data and
DeepL as a tool for translation.

## How to setup and use it

The commands need two env variables to run:

- `DATOCMS_API_TOKEN`: a DatoCMS API key with writing permissions
- `DEEPL_API_KEY`: a DeepL API key

Two commands are available:

- `npm exec translate-photographs`
- `npm exec translate-thoughts`
