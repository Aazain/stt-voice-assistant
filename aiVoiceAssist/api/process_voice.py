import spacy
from spacy.pipeline.textcat import Config, single_label_bow_config

nlp = spacy.load('en_core_web_sm')
api_pipeline = spacy.load("./api/api_prediction_model")

wh_words = {"who", "what", "where", "when", "why", "how"}
aux_verbs = {"am", "is", "are", "was", "were", "have", "has", "had", "will", "would", "may", "can", "could", "shall", "should", "must", "do", "did"}

def analyze_voice(voice):
    doc = nlp(voice)

    entities = [(ent.text, ent.label_) for ent in doc.ents]
    tokens = [(token.text, token.pos_) for token in doc]

    result = {
        "entities": entities,
        "tokens": tokens
    }

    print(result)
    voice_classification = classify_voice(voice)
    print(classify_api(voice))

    return {"classification": voice_classification, "api": (classify_api(voice) if voice_classification == "Question" else "none"), "entities": entities, "tokens": tokens}

def classify_voice(voice): 
    '''Further logic required to ensure accuracy, current version
        just checks for a question mark at the end of a sentence'''
    
    if voice[0].lower() in (wh_words, aux_verbs):
        return "Question"

    if voice.strip().endswith('?'):
        return "Question"

    return "Command"

def classify_api(data):
    doc = api_pipeline(data)
    cats = doc.cats
    label = max(cats, key=cats.get)
    return label