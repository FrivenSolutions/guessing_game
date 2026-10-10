// Word lists for each category. Add a category by adding a new key here.
window.WORD_LISTS = {
  animals: {
    label: 'Animals',
    emoji: '🦁',
    words: [
      'Dog', 'Cat', 'Horse', 'Cow', 'Pig', 'Sheep', 'Goat', 'Chicken', 'Duck', 'Rabbit',
      'Mouse', 'Hamster', 'Squirrel', 'Fox', 'Wolf', 'Bear', 'Polar Bear', 'Panda', 'Koala', 'Kangaroo',
      'Lion', 'Tiger', 'Leopard', 'Cheetah', 'Elephant', 'Giraffe', 'Zebra', 'Hippo', 'Rhino', 'Gorilla',
      'Chimpanzee', 'Monkey', 'Sloth', 'Camel', 'Llama', 'Deer', 'Moose', 'Reindeer', 'Bat', 'Hedgehog',
      'Skunk', 'Raccoon', 'Beaver', 'Otter', 'Seal', 'Walrus', 'Dolphin', 'Whale', 'Shark', 'Octopus',
      'Squid', 'Jellyfish', 'Starfish', 'Crab', 'Lobster', 'Shrimp', 'Turtle', 'Tortoise', 'Snake', 'Crocodile',
      'Lizard', 'Chameleon', 'Frog', 'Penguin', 'Ostrich', 'Flamingo', 'Peacock', 'Parrot', 'Owl', 'Eagle',
      'Swan', 'Pelican', 'Woodpecker', 'Hummingbird', 'Crow', 'Pigeon', 'Turkey', 'Bee', 'Butterfly', 'Spider',
      'Ant', 'Ladybug', 'Mosquito', 'Snail', 'Worm', 'Grasshopper', 'Scorpion', 'Goldfish', 'Seahorse', 'Platypus',
      'Armadillo', 'Porcupine', 'Hyena', 'Meerkat', 'Lemur', 'Anteater', 'Buffalo', 'Donkey', 'Mole', 'Pufferfish',
    ],
  },
  movies: {
    label: 'Movie Characters',
    emoji: '🎬',
    words: [
      'Shrek', 'Princess Fiona', 'Puss in Boots', 'Darth Vader', 'Yoda', 'Luke Skywalker', 'Princess Leia', 'Han Solo', 'Chewbacca', 'R2-D2',
      'C-3PO', 'Harry Potter', 'Hermione Granger', 'Ron Weasley', 'Dumbledore', 'Voldemort', 'Hagrid', 'Gandalf', 'Frodo', 'Gollum',
      'Legolas', 'Elsa', 'Anna', 'Olaf', 'Simba', 'Mufasa', 'Scar', 'Timon', 'Pumbaa', 'Woody',
      'Buzz Lightyear', 'Nemo', 'Dory', 'Mike Wazowski', 'Sulley', 'Lightning McQueen', 'WALL-E', 'Mr. Incredible', 'Moana', 'Maui',
      'Ariel', 'Cinderella', 'Snow White', 'Belle', 'The Beast', 'Aladdin', 'Genie', 'Mulan', 'Rapunzel', 'Pinocchio',
      'Dumbo', 'Bambi', 'Mary Poppins', 'Willy Wonka', 'Dorothy', 'Wicked Witch of the West', 'James Bond', 'Indiana Jones', 'Rocky', 'The Terminator',
      'Batman', 'The Joker', 'Superman', 'Wonder Woman', 'Spider-Man', 'Iron Man', 'Captain America', 'Thor', 'Hulk', 'Black Panther',
      'Groot', 'Thanos', 'Wolverine', 'Jack Sparrow', 'Forrest Gump', 'E.T.', 'King Kong', 'Godzilla', 'Dracula', "Frankenstein's Monster",
      'Gru', 'Minions', 'Paddington', 'Po the Panda', 'Stitch', 'Winnie the Pooh', 'Mowgli', 'Peter Pan', 'Tinker Bell', 'Captain Hook',
      'Remy the Rat', 'Barbie', 'Neo', 'Marty McFly', 'Sherlock Holmes', 'Robin Hood', 'Optimus Prime', 'Mrs. Doubtfire', 'Chucky', 'Kermit the Frog',
    ],
  },
  disney: {
    label: 'Disney & Pixar',
    emoji: '🏰',
    words: [
      // Walt Disney Animation: heroes
      'Mickey Mouse', 'Snow White', 'Pinocchio', 'Jiminy Cricket', 'Dumbo', 'Bambi', 'Cinderella', 'Fairy Godmother', 'Alice', 'Mad Hatter',
      'Cheshire Cat', 'Peter Pan', 'Tinker Bell', 'Lady and the Tramp', 'Aurora', 'Pongo', 'Mowgli', 'Baloo', 'Robin Hood', 'Winnie the Pooh',
      'Tigger', 'Eeyore', 'Piglet', 'Ariel', 'Sebastian', 'Flounder', 'King Triton', 'Belle', 'The Beast', 'Lumière',
      'Aladdin', 'Jasmine', 'Genie', 'Abu', 'Simba', 'Nala', 'Mufasa', 'Timon', 'Pumbaa', 'Rafiki',
      'Pocahontas', 'Quasimodo', 'Esmeralda', 'Hercules', 'Megara', 'Mulan', 'Mushu', 'Tarzan', 'Kuzco', 'Kronk',
      'Lilo', 'Stitch', 'Tiana', 'Rapunzel', 'Flynn Rider', 'Wreck-It Ralph', 'Vanellope', 'Elsa', 'Anna', 'Olaf',
      'Kristoff', 'Sven', 'Baymax', 'Judy Hopps', 'Nick Wilde', 'Moana', 'Maui', 'Raya', 'Mirabel', 'Bruno',
      // Walt Disney Animation: villains
      'Evil Queen', 'Wicked Stepmother', 'Queen of Hearts', 'Captain Hook', 'Maleficent', 'Cruella de Vil', 'Shere Khan', 'Kaa', 'Prince John', 'Ursula',
      'Gaston', 'Jafar', 'Scar', 'Frollo', 'Hades', 'Shan Yu', 'Yzma', 'Dr. Facilier', 'Mother Gothel', 'Hans',
      'King Candy', 'Tamatoa', 'King Magnifico',
      // Pixar: heroes
      'Woody', 'Buzz Lightyear', 'Jessie', 'Mr. Potato Head', 'Rex', 'Flik', 'Mike Wazowski', 'Sulley', 'Boo', 'Nemo',
      'Dory', 'Marlin', 'Mr. Incredible', 'Elastigirl', 'Dash', 'Jack-Jack', 'Edna Mode', 'Lightning McQueen', 'Mater', 'Remy',
      'WALL-E', 'EVE', 'Carl Fredricksen', 'Russell', 'Dug', 'Merida', 'Joy', 'Sadness', 'Anger', 'Anxiety',
      'Bing Bong', 'Miguel', 'Héctor', 'Joe Gardner', 'Luca', 'Mei Lee', 'Ember',
      // Pixar: villains
      'Sid', 'Lotso', 'Hopper', 'Randall', 'Syndrome', 'Ernesto de la Cruz',
    ],
  },
  food: {
    label: 'Food',
    emoji: '🍔',
    words: [
      'Pizza', 'Hamburger', 'Hot Dog', 'Sushi', 'Taco', 'Burrito', 'Spaghetti', 'Lasagna', 'Pancakes', 'Waffles',
      'French Fries', 'Popcorn', 'Ice Cream', 'Chocolate', 'Birthday Cake', 'Cupcake', 'Doughnut', 'Cookie', 'Brownie', 'Croissant',
      'Bagel', 'Toast', 'Sandwich', 'Banana', 'Apple', 'Orange', 'Strawberry', 'Watermelon', 'Pineapple', 'Grapes',
      'Lemon', 'Coconut', 'Mango', 'Cherry', 'Peach', 'Pear', 'Kiwi', 'Blueberry', 'Avocado', 'Carrot',
      'Broccoli', 'Potato', 'Tomato', 'Onion', 'Garlic', 'Corn on the Cob', 'Mushroom', 'Cucumber', 'Lettuce', 'Pumpkin',
      'Peas', 'Chili Pepper', 'Fried Egg', 'Bacon', 'Sausage', 'Cheese', 'Butter', 'Yogurt', 'Milkshake', 'Cereal',
      'Porridge', 'Soup', 'Salad', 'Steak', 'Roast Chicken', 'Fish and Chips', 'Meatballs', 'Noodles', 'Ramen', 'Dumplings',
      'Fried Rice', 'Curry', 'Nachos', 'Guacamole', 'Hummus', 'Peanut Butter', 'Jam', 'Honey', 'Maple Syrup', 'Marshmallow',
      'Cotton Candy', 'Lollipop', 'Chewing Gum', 'Pretzel', 'Potato Chips', 'Cheesecake', 'Apple Pie', 'Smoothie', 'Coffee', 'Tea',
      'Hot Chocolate', 'Lemonade', 'Orange Juice', 'Milk', 'Kebab', 'Falafel', 'Omelette', 'Mac and Cheese', 'Grilled Cheese', "S'mores",
    ],
  },
};
