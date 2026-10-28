import re
from collections import Counter
from typing import List, Dict, Any

STOP_WORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't",
    "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by",
    "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't",
    "down", "during", "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't", "have",
    "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself",
    "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into",
    "is", "isn't", "it", "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my",
    "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our",
    "ours", "ourselves", "out", "over", "own", "same", "shan't", "she", "she'd", "she'll", "she's",
    "should", "shouldn't", "so", "some", "such", "than", "that", "that's", "the", "their", "theirs",
    "them", "themselves", "then", "there", "there's", "these", "they", "they'd", "they'll", "they're",
    "they've", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "wasn't",
    "we", "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when", "when's",
    "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't",
    "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself",
    "yourselves"
}

def analyze_keyword_density(text: str, top_n: int = 15) -> Dict[str, Any]:
    """
    Extracts 1-word, 2-word, and 3-word keywords from body text,
    calculates exact frequency and density percentage, and warns about keyword stuffing (>3.5%).
    """
    cleaned = re.sub(r"[^\w\s]", " ", text.lower())
    words = [w for w in cleaned.split() if len(w) >= 3 and not w.isdigit()]
    total_words = len(words)

    if total_words == 0:
        return {
            "total_words": 0,
            "one_grams": [],
            "two_grams": [],
            "three_grams": [],
            "stuffing_warnings": []
        }

    # Filter stopwords for 1-grams
    content_words = [w for w in words if w not in STOP_WORDS]

    # 1-grams
    one_gram_counts = Counter(content_words).most_common(top_n)
    one_grams = []
    stuffing_warnings = []

    for word, count in one_gram_counts:
        density = round((count / total_words) * 100, 2)
        is_stuffing = density >= 3.5 and count >= 5
        if is_stuffing:
            stuffing_warnings.append({
                "keyword": word,
                "density": density,
                "count": count,
                "reason": "Density exceeds 3.5%, posing an algorithmic keyword stuffing risk in search engines."
            })
        one_grams.append({
            "keyword": word,
            "count": count,
            "density": density,
            "is_stuffing_risk": is_stuffing
        })

    # 2-grams
    two_grams_list = []
    for i in range(len(words) - 1):
        w1, w2 = words[i], words[i + 1]
        if w1 not in STOP_WORDS or w2 not in STOP_WORDS:
            two_grams_list.append(f"{w1} {w2}")
    two_gram_counts = Counter(two_grams_list).most_common(top_n)
    two_grams = [
        {"keyword": phrase, "count": count, "density": round((count / max(1, total_words - 1)) * 100, 2)}
        for phrase, count in two_gram_counts if count >= 2
    ]

    # 3-grams
    three_grams_list = []
    for i in range(len(words) - 2):
        w1, w2, w3 = words[i], words[i + 1], words[i + 2]
        if w1 not in STOP_WORDS or w3 not in STOP_WORDS:
            three_grams_list.append(f"{w1} {w2} {w3}")
    three_gram_counts = Counter(three_grams_list).most_common(top_n)
    three_grams = [
        {"keyword": phrase, "count": count, "density": round((count / max(1, total_words - 2)) * 100, 2)}
        for phrase, count in three_gram_counts if count >= 2
    ]

    return {
        "total_words": total_words,
        "unique_words": len(set(words)),
        "one_grams": one_grams,
        "two_grams": two_grams,
        "three_grams": three_grams,
        "stuffing_warnings": stuffing_warnings,
    }
