export function getRandomVibrantColor(){
  return "hsl(" + 360 * Math.random() + ',' +
             (25 + 70 * Math.random()) + '%,' +
             (40 + 10 * Math.random()) + '%)'
}

function hash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
  }
  return parseInt((hash >>> 0).toString(36).padStart(7, '0'), 36);
}

function normalize(a, b, c) {
  const maxLog = Math.ceil(Math.max(Math.log10(a), Math.log10(b), Math.log10(c)));
  const k = Math.pow(10, maxLog);
  return [a / k, b / k, c / k];
}

export function getColorByStringHash(s){
  const h1 = hash(s);
  const h2 = hash(h1.toString());
  const h3 = hash(h2.toString());
  const [a, b, c] = normalize(h1, h2, h3);
  return "hsl(" + 360 * a + ',' +
             (25 + 70 * b) + '%,' +
             (40 + 10 * c) + '%)'
}

export const stringToColour = (str) => {
  let hash = 0;
  str.split('').forEach(char => {
    hash = char.charCodeAt(0) + ((hash << 5) - hash)
  })
  let colour = '#'
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff
    colour += value.toString(16).padStart(2, '0')
  }
  return colour
}

