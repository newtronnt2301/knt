// Rebuild with: npx --yes tailwindcss@3.4.17 -c scripts/tailwind.config.cjs -i scripts/tailwind-input.css -o assets/utilities.css --minify
const path = require('node:path');
module.exports = {
  content: ['exam/index.html','learning/index.html','ประกาศผลสอบ/index.html','plickers/index.html'].map(file=>path.resolve(__dirname,'..',file)),
  theme: {extend: {
    fontFamily: {kanit:['Anuphan','sans-serif'],outfit:['Anuphan','sans-serif'],inter:['Anuphan','sans-serif']},
    colors: {darkbg:'#f5f7fa',spacebg:'#f5f7fa',carbon:'#f5f7fa',cream:'#1b3043',textlight:'#657787',darkcard:'#ffffff',neon:'#087f78',accentpurple:'#596bb6',accentblue:'#087f78',accentpink:'#ba587c',accentemerald:'#087f78',accentamber:'#a06b13',accentred:'#c34856',accentteal:'#087f78'}
  }},
};
