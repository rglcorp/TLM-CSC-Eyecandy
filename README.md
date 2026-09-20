# TLM-CSC-Eyecandy
This is a resource pack that provides a (somewhat animated) Touhou characters, which can be placed with the Minecraft Transit Railway 4.0 Eyecandy (Decoration) block.

This is primarily geared towards characters serving duty in a Customer Service Centre of various Railway Stations, replacing the old technique of placing villagers. (Which is vulnerable to (accidental or intentional) entity manipulation... and it gets boring quick :P)

Animations may also be expanded upon in the future. However it is anticipated these characters cannot serve real functionalities without the use of commands, like a villager are able to perform trading.

Pre-made model for Rigel Railway (LPS Division) are prefixed with `[Rigel] [TLM CSC]`.

## Customization/Adding new company
You may copy `rgr_lps.json` within a character and modify the configuration within to add a new entry for your own railway company.

Note: `RIDS` and `rids.js` is a reference implementation of the Rigel Information Display Standard, which transforms languages and names that conforms to Rigel Railway's standard.  
Other company should remove reference to `rids.js` in `scriptFiles`, and use `TextUtil.getNonCjkParts` for `getStaNameFunc` instead.

## License
This project (Including it's code and assets) are licensed under [CC-BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.en).

All touhou model character assets is converted and modified from [TouhouLittleMaid](https://github.com/TartaricAcid/TouhouLittleMaid), licensed under CC-BY-NC-SA 4.0.  
A list of changes made to the original assets can be found in [CHANGELOG.md](./CHANGELOG.md).