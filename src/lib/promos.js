const promo1 = `📣 Ladies and gentlemen, 

gather 'round and behold the epitome of audiovisual delight. I present to you a spectacular creation that will tickle your funny bone, tug at your heartstrings, and leave you craving for more. Enjoy the ride! 🎉

`

const promo2 = `Hey, folks! 👋🏻 
  
Brace yourselves for a mind-blowing dose of entertainment as I unveil this media masterpiece. Prepare to be simultaneously entertained and enlightened. Enjoy! ♥️`


const promo3 = `Prepare to have your visual senses dazzled and your imagination ignited as we unveil an image that defies the boundaries of brilliance.`

const promo4 = `Behold, an artistic masterpiece that will transport you to a realm of uncharted creativity. Get ready to witness the birth of a visual legend that will leave an indelible mark on your artistic consciousness. Brace yourself for an experience like no other!`

export function getPromo() {
  const promos = [promo1, promo2, promo3, promo4]
  
  return promos[getRandomInt(4)]
}


function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}