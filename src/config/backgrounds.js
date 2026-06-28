// Full-screen background images for the Home and Photo screens.
//
// To use YOUR pictures: drop them in the assets/ folder named exactly
//   assets/bg-home.png   (Home screen background)
//   assets/bg-photo.png  (Photo screen background)
// ...or change the require() paths below. .jpg works too — just update the
// filename here to match (e.g. './../../assets/bg-home.jpg').
export const BACKGROUNDS = {
  home: require('../../assets/bg-home.png'),
  photo: require('../../assets/bg-photo.png'),
};

// How dark to dim the photo so text/cards stay readable on top (0 = none).
export const BG_OVERLAY = 'rgba(255, 247, 248, 0.55)';
