"""
Complaint processing service with placeholder logic.
This service can be extended with AI classification later.
"""


def process_complaint(text: str) -> dict:
    """
    Process complaint text and return classification results.
    
    Current implementation uses rule-based logic as placeholder.
    This function can be replaced with AI/ML classification later.
    
    Args:
        text: Complaint text to process
        
    Returns:
        dict: Contains category, priority, and recommendation
    """
    text_lower = text.lower()
    
    # Category classification
    category = classify_category(text_lower)
    
    # Priority classification
    priority = classify_priority(text_lower)
    
    # Get recommendation based on category and priority
    recommendation = get_recommendation(category, priority)
    
    return {
        "category": category,
        "priority": priority,
        "recommendation": recommendation
    }


def classify_category(text: str) -> str:
    """
    Classify complaint into category using rule-based logic.
    
    Categories:
    - Product Issue: Defective, not working, faulty, broken (product itself)
    - Packaging Issue: Leak, damaged, torn, broken (packaging/delivery)
    - Trade Inquiry: Distributor, wholesale, bulk order, reseller
    """
    # Trade Inquiry keywords
    trade_keywords = ["distributor", "wholesale", "bulk order", "reseller", "retailer", "supplier", "vendor"]
    if any(keyword in text for keyword in trade_keywords):
        return "Trade Inquiry"
    
    # Packaging Issue keywords
    packaging_keywords = ["leak", "damaged", "torn", "dent", "broken packaging", "broken seal", "wet"]
    if any(keyword in text for keyword in packaging_keywords):
        return "Packaging Issue"
    
    # Product Issue keywords
    product_keywords = ["defective", "not working", "faulty", "malfunction", "broken product", "not functional", "quality"]
    if any(keyword in text for keyword in product_keywords):
        return "Product Issue"
    
    # Default to Product Issue
    return "Product Issue"


def classify_priority(text: str) -> str:
    """
    Classify complaint priority using rule-based logic.
    
    Priority levels:
    - High: Safety issues, damaged product, critical malfunction
    - Medium: Inconvenience, wrong item, partial issues
    - Low: General inquiry, minor concerns
    """
    text_lower = text.lower()
    
    # High priority keywords
    high_keywords = ["safety", "damaged", "leak", "dangerous", "critical", "urgent", "emergency", "broken", "defective"]
    if any(keyword in text_lower for keyword in high_keywords):
        return "High"
    
    # Medium priority keywords
    medium_keywords = ["inconvenience", "wrong", "incorrect", "issue", "problem", "concern", "complaint"]
    if any(keyword in text_lower for keyword in medium_keywords):
        return "Medium"
    
    # Default to Low priority
    return "Low"


def get_recommendation(category: str, priority: str) -> str:
    """
    Generate recommendation based on category and priority.
    
    Recommendations:
    - Replace product
    - Issue refund
    - Escalate to QA
    - Follow up with customer
    - Forward to sales team
    """
    if priority == "High":
        if category == "Product Issue":
            return "Replace product"
        elif category == "Packaging Issue":
            return "Replace product"
        elif category == "Trade Inquiry":
            return "Escalate to QA"
    
    elif priority == "Medium":
        if category == "Product Issue":
            return "Follow up with customer"
        elif category == "Packaging Issue":
            return "Replace product"
        elif category == "Trade Inquiry":
            return "Forward to sales team"
    
    else:  # Low priority
        if category == "Trade Inquiry":
            return "Forward to sales team"
        else:
            return "Follow up with customer"
    
    return "Follow up with customer"
