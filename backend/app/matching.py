from typing import List, Dict, Any

def normalize_skill(name: str) -> str:
    return name.strip().lower()

def calculate_skill_match(current_user: Dict[str, Any], candidate_user: Dict[str, Any]) -> Dict[str, Any]:
    """
    Computes reciprocal barter compatibility between current_user and candidate_user.
    Direct 2-way swap:
      - candidate teaches what current_user wants to learn
      - current_user teaches what candidate wants to learn
    """
    if str(current_user.get("_id")) == str(candidate_user.get("_id")):
        return {"match_score": 0, "is_eligible": False}

    my_teach_skills = {normalize_skill(s.get("name", "")): s for s in current_user.get("skills_to_teach", [])}
    my_learn_skills = {normalize_skill(s.get("name", "")): s for s in current_user.get("skills_to_learn", [])}

    their_teach_skills = {normalize_skill(s.get("name", "")): s for s in candidate_user.get("skills_to_teach", [])}
    their_learn_skills = {normalize_skill(s.get("name", "")): s for s in candidate_user.get("skills_to_learn", [])}

    # Mutual intersection
    # 1. Skills they teach that I want to learn
    mutual_learn = set(their_teach_skills.keys()).intersection(set(my_learn_skills.keys()))
    # 2. Skills I teach that they want to learn
    mutual_teach = set(my_teach_skills.keys()).intersection(set(their_learn_skills.keys()))

    is_perfect_match = bool(mutual_learn and mutual_teach)
    
    score = 40  # base baseline for peer discovery
    explanation = ""
    highlight_skill_teach = None
    highlight_skill_learn = None

    if is_perfect_match:
        learn_key = list(mutual_learn)[0]
        teach_key = list(mutual_teach)[0]
        highlight_skill_learn = their_teach_skills[learn_key].get("name")
        highlight_skill_teach = my_teach_skills[teach_key].get("name")
        
        # Rating boost
        avg_rating = candidate_user.get("rating_summary", {}).get("average_rating", 5.0)
        score = int(90 + min(8, (avg_rating / 5.0) * 8))
        explanation = f"⚡ Perfect Skill Exchange! You teach {highlight_skill_teach} which they want, and they teach {highlight_skill_learn} which you want."
    elif mutual_learn:
        learn_key = list(mutual_learn)[0]
        highlight_skill_learn = their_teach_skills[learn_key].get("name")
        score = 75
        explanation = f"Great Tutor Match! They teach {highlight_skill_learn} which you want to learn."
    elif mutual_teach:
        teach_key = list(mutual_teach)[0]
        highlight_skill_teach = my_teach_skills[teach_key].get("name")
        score = 65
        explanation = f"Mentorship Opportunity! You teach {highlight_skill_teach} which they are eager to learn."
    else:
        score = 45
        explanation = "Explore complementary skills and propose an exchange."

    return {
        "match_score": min(score, 99),
        "is_perfect_match": is_perfect_match,
        "highlight_skill_learn": highlight_skill_learn,
        "highlight_skill_teach": highlight_skill_teach,
        "explanation": explanation,
        "candidate": candidate_user
    }
