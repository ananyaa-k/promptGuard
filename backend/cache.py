import os
import logging

logger = logging.getLogger("promptguard.cache")
logging.basicConfig(level=logging.INFO)

# In-memory storage for cached system prompts: list of dicts with {"prompt": str, "embeddings": list, "report": dict}
_prompt_cache = []
_model = None
_model_failed = False

def init_embedding_model():
    global _model, _model_failed
    if _model is not None or _model_failed:
        return
    
    try:
        from sentence_transformers import SentenceTransformer
        logger.info("Initializing SentenceTransformer model 'all-MiniLM-L6-v2'...")
        # Load lightweight model
        _model = SentenceTransformer('all-MiniLM-L6-v2')
        logger.info("SentenceTransformer model loaded successfully.")
    except Exception as e:
        logger.warning(f"Failed to load sentence-transformers, using fallback similarity: {e}")
        _model_failed = True

def compute_jaccard_similarity(str1: str, str2: str) -> float:
    """Fallback word-level overlap similarity."""
    words1 = set(str1.lower().split())
    words2 = set(str2.lower().split())
    if not words1 and not words2:
        return 1.0
    intersection = words1.intersection(words2)
    union = words1.union(words2)
    return len(intersection) / len(union)

def check_cache(system_prompt: str, similarity_threshold: float = 0.95) -> dict:
    """
    Checks if a semantically similar system prompt exists in the cache.
    Returns the cached report if found, otherwise None.
    """
    if not system_prompt:
        return None

    init_embedding_model()
    
    logger.info(f"Checking cache for system prompt: '{system_prompt[:60]}...'")
    
    # Try semantic check if model is loaded
    if _model is not None:
        try:
            import numpy as np
            query_vector = _model.encode([system_prompt])[0]
            
            for item in _prompt_cache:
                cached_vector = item["embeddings"]
                # Cosine similarity
                dot_product = np.dot(query_vector, cached_vector)
                norm_q = np.linalg.norm(query_vector)
                norm_c = np.linalg.norm(cached_vector)
                
                similarity = dot_product / (norm_q * norm_c) if norm_q > 0 and norm_c > 0 else 0.0
                
                if similarity >= similarity_threshold:
                    logger.info(f"Semantic cache HIT (similarity: {similarity:.4f})")
                    return item["report"]
        except Exception as e:
            logger.error(f"Error checking semantic cache: {e}. Falling back to Jaccard.")
            
    # Fallback to Jaccard similarity
    for item in _prompt_cache:
        similarity = compute_jaccard_similarity(system_prompt, item["prompt"])
        if similarity >= similarity_threshold:
            logger.info(f"Fallback cache HIT (Jaccard similarity: {similarity:.4f})")
            return item["report"]
            
    logger.info("Cache MISS.")
    return None

def update_cache(system_prompt: str, report: dict):
    """
    Caches the system prompt and its associated report.
    """
    if not system_prompt or not report:
        return

    init_embedding_model()
    
    # Check if exact prompt already exists
    for item in _prompt_cache:
        if item["prompt"] == system_prompt:
            item["report"] = report
            return
            
    embeddings = None
    if _model is not None:
        try:
            embeddings = _model.encode([system_prompt])[0]
        except Exception as e:
            logger.error(f"Error generating embedding for cache: {e}")
            
    _prompt_cache.append({
        "prompt": system_prompt,
        "embeddings": embeddings,
        "report": report
    })
    logger.info(f"Cached system prompt successfully. Total cache size: {len(_prompt_cache)}")
