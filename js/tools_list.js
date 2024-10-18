let tools_list = {};

/* OpenAI compatible tool/functions */
tools_list.openai_compatible = {
    googleSearch: {
        "type": "function",
        "function": {
            "name": "googleSearch",
            "description": "Search for a term in Google Search. Call this whenever you need to make a search on Google, for example when a customer asks 'What is the news today' or something like 'Nvidia stock price today'",
            "parameters": {
                "type": "object",
                "properties": {
                    "term": {
                        "type": "string",
                        "description": "The term to be searched on Google"
                    }
                },
                "required": ["term"],
                "additionalProperties": false
            }
        },
        "strict": true
    },
}


/* Google Gemini compatible tool/functions */
tools_list.google_compatible = {
    googleSearch: {
            "functionDeclarations": [
                {
                    "name": "googleSearch",
                    "description": "Search for a term in Google Search. Call this whenever you need to make a search on Google, for example when a customer asks 'What is the news today' or something like 'Nvidia stock price today'",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "term": {
                                "type": "string"
                            }
                        },
                        "required": [
                            "term"
                        ]
                    }
                }
            ]
        }
}


/* Anthropic compatible tool */
tools_list.anthropic_compatible = {
    googleSearch: {
        "name": "googleSearch",
        "description": "Search for a term in Google Search. Call this whenever you need to make a search on Google, for example when a customer asks 'What is the news today' or something like 'Nvidia stock price today'",
        "input_schema": {
            "type": "object",
            "properties": {
                "term": {
                    "type": "string",
                    "description": "The term to be searched on Google"
                }
            },
            "required": ["term"]
        }
    }
};



tools_list.cohere_compatible = {
    googleSearch: {
        "type": "function",
        "function": {
            "name": "googleSearch",
            "description": "Search for a term in Google Search. Call this whenever you need to make a search on Google, for example when a customer asks 'What is the news today' or something like 'Nvidia stock price today'",
            "parameters": {
                "type": "object",
                "properties": {
                    "term": {
                        "type": "string",
                        "description": "The term to be searched on Google"
                    }
                },
                "required": ["term"]
            }
        }
    },
}