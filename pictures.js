// Picture lists for Picture Guess. Each entry is [emoji, word] or [emoji, word, old].
// Plain entries use emoji from Unicode 12 (2019) or older, so every phone shows them.
// Entries with newer emoji need a third value for old-phone mode:
//   an older emoji to show instead, or null to hide the entry.
window.PICTURE_LISTS = {
  animals: {
    label: 'Animals',
    emoji: '🐘',
    words: [
      ['🐶', 'Dog'], ['🐱', 'Cat'], ['🐭', 'Mouse'], ['🐹', 'Hamster'], ['🐰', 'Rabbit'],
      ['🦊', 'Fox'], ['🐻', 'Bear'], ['🐼', 'Panda'], ['🐨', 'Koala'], ['🐯', 'Tiger'],
      ['🦁', 'Lion'], ['🐮', 'Cow'], ['🐷', 'Pig'], ['🐸', 'Frog'], ['🐵', 'Monkey'],
      ['🐔', 'Chicken'], ['🐧', 'Penguin'], ['🦆', 'Duck'], ['🦉', 'Owl'], ['🦅', 'Eagle'],
      ['🐺', 'Wolf'], ['🐴', 'Horse'], ['🦄', 'Unicorn'], ['🐝', 'Bee'], ['🐛', 'Caterpillar'],
      ['🦋', 'Butterfly'], ['🐌', 'Snail'], ['🐞', 'Ladybug'], ['🐜', 'Ant'], ['🕷️', 'Spider'],
      ['🐢', 'Turtle'], ['🐍', 'Snake'], ['🦎', 'Lizard'], ['🦖', 'T-Rex'], ['🦕', 'Long-Neck Dinosaur'],
      ['🐙', 'Octopus'], ['🦀', 'Crab'], ['🦞', 'Lobster'], ['🐠', 'Fish'], ['🐡', 'Pufferfish'],
      ['🐬', 'Dolphin'], ['🐳', 'Whale'], ['🦈', 'Shark'], ['🐊', 'Crocodile'], ['🦓', 'Zebra'],
      ['🦍', 'Gorilla'], ['🐘', 'Elephant'], ['🦒', 'Giraffe'], ['🦛', 'Hippo'], ['🦏', 'Rhino'],
      ['🐪', 'Camel'], ['🦘', 'Kangaroo'], ['🐑', 'Sheep'], ['🐐', 'Goat'], ['🦌', 'Deer'],
      ['🦔', 'Hedgehog'], ['🦇', 'Bat'], ['🦩', 'Flamingo'], ['🦚', 'Peacock'], ['🦜', 'Parrot'],
      ['🦥', 'Sloth'], ['🦦', 'Otter'], ['🦨', 'Skunk'], ['🐿️', 'Squirrel'], ['🦃', 'Turkey'],
      ['🦢', 'Swan'], ['🦙', 'Llama'], ['🦝', 'Raccoon'],
      // Newer emoji (Unicode 13-15)
      ['🦫', 'Beaver', null], ['🦭', 'Seal', null], ['🦣', 'Mammoth', null], ['🦬', 'Bison', null], ['🦤', 'Dodo', null],
      ['🪲', 'Beetle', null], ['🪱', 'Worm', null], ['🪰', 'Fly', null], ['🐻‍❄️', 'Polar Bear', null], ['🫎', 'Moose', null],
      ['🫏', 'Donkey', null], ['🪿', 'Goose', null], ['🪼', 'Jellyfish', null],
    ],
  },
  food: {
    label: 'Food',
    emoji: '🍕',
    words: [
      ['🍕', 'Pizza'], ['🍔', 'Hamburger'], ['🌭', 'Hot Dog'], ['🍟', 'French Fries'], ['🌮', 'Taco'],
      ['🌯', 'Burrito'], ['🍝', 'Spaghetti'], ['🍣', 'Sushi'], ['🍜', 'Noodles'], ['🍩', 'Doughnut'],
      ['🍪', 'Cookie'], ['🎂', 'Birthday Cake'], ['🧁', 'Cupcake'], ['🍦', 'Ice Cream'], ['🍫', 'Chocolate'],
      ['🍭', 'Lollipop'], ['🍬', 'Candy'], ['🍿', 'Popcorn'], ['🥞', 'Pancakes'], ['🧇', 'Waffle'],
      ['🥐', 'Croissant'], ['🥨', 'Pretzel'], ['🍞', 'Bread'], ['🧀', 'Cheese'], ['🥚', 'Egg'],
      ['🥓', 'Bacon'], ['🍎', 'Apple'], ['🍌', 'Banana'], ['🍊', 'Orange'], ['🍋', 'Lemon'],
      ['🍉', 'Watermelon'], ['🍇', 'Grapes'], ['🍓', 'Strawberry'], ['🍒', 'Cherries'], ['🍑', 'Peach'],
      ['🍍', 'Pineapple'], ['🥥', 'Coconut'], ['🥝', 'Kiwi'], ['🥑', 'Avocado'], ['🥕', 'Carrot'],
      ['🌽', 'Corn'], ['🥦', 'Broccoli'], ['🍄', 'Mushroom'], ['🥔', 'Potato'], ['🌶️', 'Chili Pepper'],
      ['🥒', 'Cucumber'], ['🍅', 'Tomato'], ['🥜', 'Peanuts'], ['🍯', 'Honey'], ['🥛', 'Milk'],
      ['🧃', 'Juice Box'], ['🥪', 'Sandwich'], ['🥗', 'Salad'], ['🍗', 'Chicken Leg'], ['🍲', 'Soup'],
      // Newer emoji (Unicode 13-15)
      ['🫐', 'Blueberries', null], ['🫒', 'Olives', null], ['🫑', 'Bell Pepper', null], ['🧋', 'Bubble Tea', null], ['🫕', 'Fondue', null],
      ['🫓', 'Flatbread', null], ['🫘', 'Beans', null], ['🫛', 'Pea Pod', null], ['🫚', 'Ginger', null], ['🫖', 'Teapot', null],
    ],
  },
  actions: {
    label: 'Actions',
    emoji: '🏊',
    words: [
      ['🏊', 'Swim'], ['😴', 'Sleep'], ['🎸', 'Play Guitar'], ['🥁', 'Play Drums'], ['🎤', 'Sing'],
      ['💃', 'Dance'], ['🏃', 'Run'], ['🚴', 'Ride a Bike'], ['⚽', 'Play Soccer'], ['🏀', 'Play Basketball'],
      ['🎾', 'Play Tennis'], ['⛳', 'Play Golf'], ['🎳', 'Go Bowling'], ['🏄', 'Surf'], ['⛷️', 'Ski'],
      ['⛸️', 'Ice Skate'], ['🛹', 'Skateboard'], ['🤸', 'Do a Cartwheel'], ['🧘', 'Do Yoga'], ['🏋️', 'Lift Weights'],
      ['🎣', 'Go Fishing'], ['🧗', 'Climb'], ['🍳', 'Cook'], ['🛁', 'Take a Bath'], ['📸', 'Take a Photo'],
      ['📖', 'Read a Book'], ['🎨', 'Paint'], ['🧹', 'Sweep'], ['🤧', 'Sneeze'], ['🥱', 'Yawn'],
      ['🤣', 'Laugh'], ['😭', 'Cry'], ['👋', 'Wave'], ['👏', 'Clap'], ['🎢', 'Ride a Roller Coaster'],
      ['🏇', 'Ride a Horse'], ['🎮', 'Play Video Games'], ['📞', 'Talk on the Phone'], ['🤹', 'Juggle'], ['🧙', 'Cast a Spell'],
      ['✈️', 'Fly a Plane'], ['🚗', 'Drive a Car'], ['🍦', 'Lick an Ice Cream'], ['🪁', 'Fly a Kite'], ['🤿', 'Snorkel'],
      // Newer emoji (Unicode 13-15)
      ['🪥', 'Brush Your Teeth', null], ['🛼', 'Roller Skate', null], ['🥷', 'Be a Ninja', null], ['🫧', 'Blow Bubbles', null], ['🫡', 'Salute', null],
      ['🪇', 'Shake Maracas', null], ['🪈', 'Play the Flute', null], ['🛝', 'Go Down a Slide', null], ['🫣', 'Peek-a-boo', null], ['🫠', 'Melt', null],
      ['🪭', 'Fan Yourself', null], ['🫶', 'Make a Heart', null], ['🪄', 'Do Magic', '🧙'],
    ],
  },
  things: {
    label: 'Things & Vehicles',
    emoji: '🚀',
    words: [
      ['🚀', 'Rocket'], ['🚂', 'Train'], ['🚌', 'Bus'], ['🚒', 'Fire Truck'], ['🚓', 'Police Car'],
      ['🚑', 'Ambulance'], ['🚜', 'Tractor'], ['🚲', 'Bicycle'], ['🛴', 'Scooter'], ['🏍️', 'Motorcycle'],
      ['🚁', 'Helicopter'], ['✈️', 'Airplane'], ['⛵', 'Sailboat'], ['🚢', 'Ship'], ['🎈', 'Balloon'],
      ['🎁', 'Present'], ['☂️', 'Umbrella'], ['🎢', 'Roller Coaster'], ['🎡', 'Ferris Wheel'], ['🎠', 'Carousel'],
      ['🏰', 'Castle'], ['⏰', 'Alarm Clock'], ['💡', 'Light Bulb'], ['🔦', 'Flashlight'], ['📱', 'Phone'],
      ['📺', 'TV'], ['📷', 'Camera'], ['🔑', 'Key'], ['🔨', 'Hammer'], ['✂️', 'Scissors'],
      ['🖍️', 'Crayon'], ['🎒', 'Backpack'], ['👑', 'Crown'], ['👓', 'Glasses'], ['🕶️', 'Sunglasses'],
      ['🧢', 'Cap'], ['👟', 'Sneakers'], ['🧦', 'Socks'], ['🧸', 'Teddy Bear'], ['🎲', 'Dice'],
      ['🧩', 'Puzzle'], ['🔔', 'Bell'], ['🛏️', 'Bed'], ['🚽', 'Toilet'], ['⛄', 'Snowman'],
      ['🌈', 'Rainbow'], ['☀️', 'Sun'], ['🌙', 'Moon'], ['⚡', 'Lightning'], ['🌋', 'Volcano'],
      ['🎃', 'Pumpkin Lantern'], ['🎄', 'Christmas Tree'], ['💎', 'Diamond'], ['🧲', 'Magnet'], ['🔭', 'Telescope'],
      ['🦷', 'Tooth'], ['🪀', 'Yo-yo'], ['🧭', 'Compass'], ['🗺️', 'Map'], ['⚓', 'Anchor'],
      ['🪐', 'Planet'],
      // Newer emoji (Unicode 13-15)
      ['🪄', 'Magic Wand', null], ['🪅', 'Piñata', null], ['🪆', 'Nesting Dolls', null], ['🛻', 'Pickup Truck', null], ['🪃', 'Boomerang', null],
      ['🪜', 'Ladder', null], ['🪣', 'Bucket', null], ['🪞', 'Mirror', null], ['🪨', 'Rock', null], ['🛟', 'Life Ring', null],
      ['🛞', 'Wheel', null], ['🪸', 'Coral', null], ['🪩', 'Disco Ball', null], ['🪙', 'Coin', null], ['🛖', 'Hut', null],
    ],
  },
};
