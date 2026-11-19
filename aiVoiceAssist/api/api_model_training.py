import spacy
from spacy.pipeline.textcat import Config
from spacy.training.example import Example
import random

nlp = spacy.blank('en')

train_data = [ #Random training dataset, this can be expanded on to improve accuracy of the model

    #weather
    ("What's the weather like today?", {"cats": {"weather": 1, "news": 0, "wiki": 0}}),
    ("Is it cold outside today?", {"cats": {"weather": 1, "news": 0, "wiki": 0}}),
    ("Do I need a jacket today?", {"cats": {"weather": 1, "news": 0, "wiki": 0}}),
    ("What's the temperature in Paris today?", {"cats": {"weather": 1, "news": 0, "wiki": 0}}),
    ("What's the weather like in Miami?", {"cats": {"weather": 1, "news": 0, "wiki": 0}}),
    ("What's the weather like in Tokyo today?", {"cats": {"weather": 1, "news": 0, "wiki": 0}}),
    ("When will it start raining?", {"cats": {"weather": 1, "news": 0, "wiki": 0}}),
    ("Are there flood warnings in my area?", {"cats": {"weather": 1, "news": 0, "wiki": 0}}),
    ("Will it be cloudy tonight?", {"cats": {"weather": 1, "news": 0, "wiki": 0}}),
    ("How hot will it get today?", {"cats": {"weather": 1, "news": 0, "wiki": 0}}),
    ("Will temperatures drop this weekend?", {"cats": {"weather": 1, "news": 0, "wiki": 0}}),
    ("What's the wind speed today?", {"cats": {"weather": 1, "news": 0, "wiki": 0}}),
    ("Can I expect thunderstorms tonight?", {"cats": {"weather": 1, "news": 0, "wiki": 0}}),
    ("What's the weather like in Rome this week?", {"cats": {"weather": 1, "news": 0, "wiki": 0}}),
    ("Is it safe to drive in this snow?", {"cats": {"weather": 1, "news": 0, "wiki": 0}}),
    ("Are we expecting hail today?", {"cats": {"weather": 1, "news": 0, "wiki": 0}}),
    ("Will there be a rainbow today?", {"cats": {"weather": 1, "news": 0, "wiki": 0}}),
    ("What's the sunrise time tomorrow?", {"cats": {"weather": 1, "news": 0, "wiki": 0}}),
    ("Is it foggy in the morning?", {"cats": {"weather": 1, "news": 0, "wiki": 0}}),
    ("How cold will it be tonight?", {"cats": {"weather": 1, "news": 0, "wiki": 0}}),
    ("Will it be humid tomorrow?", {"cats": {"weather": 1, "news": 0, "wiki": 0}}),
    ("Should I carry an umbrella today?", {"cats": {"weather": 1, "news": 0, "wiki": 0}}),
    ("Are there any air quality alerts?", {"cats": {"weather": 1, "news": 0, "wiki": 0}}),
    ("What's the chance of rain this afternoon?", {"cats": {"weather": 1, "news": 0, "wiki": 0}}),

    #wiki
    ("When is Brad Pitt's birthday?", {"cats": {"weather": 0, "news": 0, "wiki": 1}}),
    ("Did the Raptors win last nights game?", {"cats": {"weather": 0, "news": 1, "wiki": 0}}),
    ("How tall is Mount Everest?", {"cats": {"weather": 0, "news": 0, "wiki": 1}}),
    ("Who invented the telephone?", {"cats": {"weather": 0, "news": 0, "wiki": 1}}),
    ("What is the tallest building in the world?", {"cats": {"weather": 0, "news": 0, "wiki": 1}}),
    ("When will the summer start?", {"cats": {"weather": 0, "news": 0, "wiki": 1}}),
    ("What is the capital of Australia?", {"cats": {"weather": 0, "news": 0, "wiki": 1}}),
    ("Who discovered penicillin?", {"cats": {"weather": 0, "news": 0, "wiki": 1}}),
    ("How many bones are in the human body?", {"cats": {"weather": 0, "news": 0, "wiki": 1}}),
    ("What's the boiling point of water?", {"cats": {"weather": 0, "news": 0, "wiki": 1}}),
    ("What's the largest desert in the world?", {"cats": {"weather": 0, "news": 0, "wiki": 1}}),
    ("How does photosynthesis work?", {"cats": {"weather": 0, "news": 0, "wiki": 1}}),
    ("Who was the first man on the moon?", {"cats": {"weather": 0, "news": 0, "wiki": 1}}),
    ("What is quantum entanglement?", {"cats": {"weather": 0, "news": 0, "wiki": 1}}),
    ("What's the history of the Roman Empire?", {"cats": {"weather": 0, "news": 0, "wiki": 1}}),
    ("What's the Pythagorean theorem?", {"cats": {"weather": 0, "news": 0, "wiki": 1}}),
    ("How do black holes form?", {"cats": {"weather": 0, "news": 0, "wiki": 1}}),
    ("How does the human brain process memories?", {"cats": {"weather": 0, "news": 0, "wiki": 1}}),
    ("How are rainbows formed?", {"cats": {"weather": 0, "news": 0, "wiki": 1}}),
    ("How does the immune system fight infections?", {"cats": {"weather": 0, "news": 0, "wiki": 1}}),
    ("How is chocolate made?", {"cats": {"weather": 0, "news": 0, "wiki": 1}}),
    ("How does photosynthesis produce oxygen?", {"cats": {"weather": 0, "news": 0, "wiki": 1}}),
    ("How do migratory birds navigate?", {"cats": {"weather": 0, "news": 0, "wiki": 1}}),
    ("How do cells divide?", {"cats": {"weather": 0, "news": 0, "wiki": 1}}),
    ("How is steel manufactured?", {"cats": {"weather": 0, "news": 0, "wiki": 1}}),
    ("How old is Keanu Reeves?", {"cats": {"weather": 0, "news": 0, "wiki": 1}}),
    ("How do cells divide?", {"cats": {"weather": 0, "news": 0, "wiki": 1}}),
    ("How is steel manufactured?", {"cats": {"weather": 0, "news": 0, "wiki": 1}}),


    #news
    ("What was the election result?", {"cats": {"weather": 0, "news": 1, "wiki": 0}}),
    ("What's the latest update on the stock market crash?", {"cats": {"weather": 0, "news": 1, "wiki": 0}}),
    ("What happened to the Apple stock price?", {"cats": {"weather": 0, "news": 1, "wiki": 0}}),
    ("Did Bitcoin go up today?", {"cats": {"weather": 0, "news": 1, "wiki": 0}}),
    ("Did the price of Bitcoin go up today?", {"cats": {"weather": 0, "news": 1, "wiki": 0}}),
    ("Did the price of Ethereum go up today?", {"cats": {"weather": 0, "news": 1, "wiki": 0}}),
    ("Did the price of XRP go up today?", {"cats": {"weather": 0, "news": 1, "wiki": 0}}),
    ("Did the price of Solana go up today?", {"cats": {"weather": 0, "news": 1, "wiki": 0}}),
    ("What percentage is Bitcoin up in the past year?", {"cats": {"weather": 0, "news": 1, "wiki": 0}}),
    ("Is Air Canada still being sued?", {"cats": {"weather": 0, "news": 1, "wiki": 0}}),
    ("What's the latest development in Gaza?", {"cats": {"weather": 0, "news": 1, "wiki": 0}}),
    ("Has the unemployment rate changed?", {"cats": {"weather": 0, "news": 1, "wiki": 0}}),
    ("Are support workers still protesting?", {"cats": {"weather": 0, "news": 1, "wiki": 0}}),

]

# testcat = text categorizer. Exclusive classes ensures a singula label for each line of text.
textcat = nlp.add_pipe("textcat")

for label in ['weather', 'news', 'wiki']: # adding labels to the text categorizer model
    textcat.add_label(label)

examples = [] # holds processed training examples
for text, categories in train_data: #formats the training examples into a the Example training format for spaCy
    doc = nlp.make_doc(text)
    examples.append(Example.from_dict(doc, categories))

optimizer = nlp.initialize()

for epoch in range(5): #epoch represents an iteration over dataset (in this case the model goes over the dataset "train_data" 5 times)
    random.shuffle(examples)
    print(examples)
    nlp.update(examples, sgd=optimizer)

nlp.to_disk("api_prediction_model")