import heapq

DICT = {
    "ABRA", "ACTO", "AGUA", "AIRE", "ALBA", "ALMA", "ALTO", "ANCA", "ANTE", "ARCO",
    "AREA", "ARMA", "ARTE", "ATAR", "AULA", "AUTO", "AVES", "BALA", "BECA", "BESO",
    "BOCA", "BODA", "BOLA", "BOLO", "BOTA", "CADA", "CAFE", "CARA", "CARO", "CASA",
    "CASO", "CELO", "CENA", "CERA", "CERO", "COLA", "COMA", "COPA", "CORO", "COSA",
    "COTA", "CUBA", "DADO", "DAMA", "DAME", "DATA", "DEDO", "DEJO", "DIOS", "DONA",
    "DOTE", "DUDA", "DUNA", "FAMA", "FARO", "FILA", "FILO", "FINO", "FOCA", "FOCO",
    "GALA", "GAMA", "GANA", "GATO", "GIRO", "GOLA", "GOMA", "GOTA", "GUIA", "HADA",
    "HALO", "HIJA", "HILO", "HORA", "HUMO", "IDEA", "ISLA", "LACA", "LAMA", "LANA",
    "LAPA", "LATA", "LAVA", "LEJA", "LEMA", "LENA", "LIRA", "LISA", "LISO", "LOBA",
    "LOBO", "LOCA", "LOCO", "LODO", "LOGO", "LONA", "LORA", "LOSA", "LOTA", "LOZA",
    "LUNA", "LUPA", "MACA", "MALO", "MANA", "MANO", "MAPA", "MARA", "MASA", "MATE",
    "MATO", "MAYO", "MESA", "MIEL", "MIMA", "MINA", "MIRA", "MISA", "MITO", "MODA",
    "MODO", "MOLA", "MONA", "MORA", "MOTA", "MOZO", "MUDA", "MULA", "MUSA", "NADA",
    "NATA", "NAVE", "NIDO", "NORA", "NOTA", "NUCA", "OCIO", "ODIO", "OLEO", "OLLA",
    "OLMO", "ONDA", "ORCA", "PAJA", "PALA", "PALO", "PAPA", "PARA", "PASA", "PASO",
    "PATA", "PATO", "PAVA", "PAVO", "PECA", "PELO", "PENA", "PERA", "PESO", "PICO",
    "PILA", "PINO", "PIPA", "PISA", "PISO", "PITA", "POCA", "POCO", "PODA", "POLO",
    "POMA", "POPA", "POSA", "POTA", "POZA", "PURO", "RACA", "RAGA", "RAJA", "RALO",
    "RANA", "RASA", "RATO", "RAYA", "RAZA", "REJA", "REMA", "ROBA", "ROCA", "ROJA",
    "ROJO", "ROLA", "RONA", "ROPA", "ROSA", "ROTA", "ROTO", "RUCA", "RUDA", "RUGA",
    "RUMA", "RUNA", "SACO", "SALA", "SANA", "SAPO", "SARA", "SECA", "SECO", "SEDA",
    "SETA", "SILO", "SIMA", "SINO", "SOCA", "SODA", "SOJA", "SOLA", "SOLO", "SOMA",
    "SOPA", "SORA", "SOTA", "SUMO", "TABA", "TACO", "TAJA", "TALA", "TALO", "TAMO",
    "TAPA", "TARA", "TASA", "TEJA", "TELA", "TEMA", "TENA", "TIRA", "TODA", "TODO",
    "TOMA", "TONA", "TORA", "TORO", "TOSA", "TOTA", "TUCA", "TUNA", "VACA", "VALE",
    "VANO", "VARA", "VASO", "VELA", "VENA", "VERA", "VETA", "VISA", "VISO", "VITA",
    "VOTO", "YATE", "YUCA", "ZONA", "ZOPA"
}

# ── Heuristic Functions ──

def calculate_heuristic(word_a: str, word_b: str, heuristic_type: str = 'hamming') -> int:
    """
    Calculates the heuristic distance between two words.
    
    Args:
        word_a: The current word.
        word_b: The goal word.
        heuristic_type: 'hamming', 'zero', or 'greedy'.
        
    Returns:
        The estimated distance.
    """
    distance = 0
    for i in range(len(word_a)):
        if word_a[i] != word_b[i]:
            distance += 1
    
    if heuristic_type == 'zero':
        return 0 # Dijkstra / BFS (Ignores distance to goal)
    elif heuristic_type == 'greedy':
        return distance * 3 # Greedy Search (Overestimates distance to goal, faster but sub-optimal)
        
    return distance # Hamming (A* Optimal)

# ── Helper Functions ──

def get_neighbors(word: str) -> list[str]:
    """Generates all valid neighbor words (1 letter change) that exist in the dictionary."""
    neighbors = []
    alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    
    for i in range(len(word)):
        for char in alphabet:
            if char == word[i]:
                continue
            
            new_word = word[:i] + char + word[i+1:]
            
            if new_word in DICT:
                neighbors.append(new_word)
                
    return neighbors

# ── A* Search Algorithm ──

def a_star_search(start_word: str, goal_word: str, heuristic_type: str = 'hamming'):
    """
    Executes the A* algorithm to find the shortest path between start_word and goal_word.
    """
    # Verify words are 4 letters and exist in our small dictionary (adding them if not)
    if len(start_word) != 4 or len(goal_word) != 4:
        return "Words must be 4 letters long."
    
    DICT.add(start_word)
    DICT.add(goal_word)

    # Priority queue for the open list. Stores tuples of (f_score, h_score, word)
    # heapq automatically sorts by the first element (f_score), then second (h_score) if there's a tie
    open_list = []
    
    # Dictionaries to keep track of costs and paths
    # g_scores: cost from start to a word
    g_scores = {start_word: 0}
    # came_from: tracks the parent word to reconstruct the optimal path later
    came_from = {start_word: None}
    
    # Initialize the open list with the start word
    initial_h = calculate_heuristic(start_word, goal_word, heuristic_type)
    heapq.heappush(open_list, (initial_h, initial_h, start_word)) # f, h, word
    
    nodes_explored = 0

    while open_list:
        # 1. Pop the word with the lowest f_score (ties broken by lowest h_score)
        current_f, current_h, current_word = heapq.heappop(open_list)
        nodes_explored += 1
        
        # 2. Check if we reached the goal
        if current_word == goal_word:
            # Reconstruct the path backwards
            path = []
            while current_word is not None:
                path.append(current_word)
                current_word = came_from[current_word]
            path.reverse()
            return {
                "success": True, 
                "path": path, 
                "explored": nodes_explored,
                "heuristic_used": heuristic_type
            }
            
        # 3. Explore neighbors
        current_g = g_scores[current_word]
        
        for neighbor in get_neighbors(current_word):
            # Cost to reach this neighbor is cost to current + 1 step
            tentative_g = current_g + 1
            
            # If we found a faster path to this neighbor (or it's our first time seeing it)
            if neighbor not in g_scores or tentative_g < g_scores[neighbor]:
                g_scores[neighbor] = tentative_g
                came_from[neighbor] = current_word
                h_score = calculate_heuristic(neighbor, goal_word, heuristic_type)
                f_score = tentative_g + h_score
                
                # Add to open list to be explored later
                heapq.heappush(open_list, (f_score, h_score, neighbor))
                
    return {"success": False, "message": "No path found.", "explored": nodes_explored}

# ── Execution Examples ──
if __name__ == "__main__":
    print("=== Word Ladder A* Algorithm ===")
    
    start = "GATO"
    goal = "LOBO"
    
    print(f"\nFinding path from '{start}' to '{goal}'...")
    
    result_optimal = a_star_search(start, goal, 'hamming')
    print("\n--- 1. Optimal Search (Hamming Heuristic) ---")
    print(f"Path: {' -> '.join(result_optimal['path'])}")
    print(f"Path Length: {len(result_optimal['path']) - 1} steps")
    print(f"Nodes Explored: {result_optimal['explored']}")
    
    result_greedy = a_star_search(start, goal, 'greedy')
    print("\n--- 2. Greedy Search (Overestimating Heuristic) ---")
    print(f"Path: {' -> '.join(result_greedy['path'])}")
    print(f"Path Length: {len(result_greedy['path']) - 1} steps")
    print(f"Nodes Explored: {result_greedy['explored']}")
    
    result_zero = a_star_search(start, goal, 'zero')
    print("\n--- 3. Dijkstra Search BFS (Zero Heuristic) ---")
    print(f"Path: {' -> '.join(result_zero['path'])}")
    print(f"Path Length: {len(result_zero['path']) - 1} steps")
    print(f"Nodes Explored: {result_zero['explored']}")
