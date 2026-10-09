/**
 * Re-export of the generated PNG assets. Every entry is a static require() so
 * Metro bundles it; the asset pipeline guarantees all of these files exist.
 */

export const assets = {
  bgLoader: require('../../assets/bg_loader.png'),
  bgMenu: require('../../assets/bg_menu.png'),
  bgGame: require('../../assets/bg_game.png'),
  spriteHero: require('../../assets/sprite_hero.png'),
  spriteBulb: require('../../assets/sprite_bulb.png'),
  spriteTrophy: require('../../assets/sprite_trophy.png'),
};

export default assets;
