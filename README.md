# Orion
Orion is a web-based chat interface that simplifies interactions with multiple AI model providers.
It provides a unified platform for chatting and exploring multiple large language models (LLMs), including:

- 🛠️ Ollama – An open-source tool for running LLMs locally 🏡 
- 🤖 OpenAI (GPT model)
- 🎯 Cohere (Command-r models)
- 🌌 Google (Gemini models)
- 🟡 Anthropic (Claude models)
- 🚀 Groq Inc. – Optimized for fast inference (open source models) ⚡️
- ⚡️ Cerebras – Also optimized for fast inference 🚀

It's like assembling the ultimate superhero team of AI

![Orion Screenshot](imgs/screenshot.png "Orion Screenshot")


With Orion, users can easily navigate and assess the strengths and limitations of different AI models through an intuitive,
user-friendly interface.

## Key Features

- 🖥️ Browser - No need to download anything ⚡️
- 🗣️ TTS - Realistic text-to-speech using ElevenLabs
- 🎙️ STT - Speech-to-Text using Groq/Whisper ️
- 🔄 Seamless integration with multiple AI models
- ✨ Clean and responsive web interface 🌐
- 🌈 Syntax highlighting for code snippets 🖌️
- ⬇️ One-click download for AI-generated code outputs
- 🎛️ Customizable system prompts to tailor responses 🛠️
- 🌐 Special command for quick and easy language translation tasks
- 📁 Upload a variety of documents (text, PDF, images, video) to Google Gemini for analysis and processing



## API Key Management

Your API keys are stored locally using `localStorage`, and requests are sent directly to the official provider's API
(OpenAI, Anthropic, Google, Groq, Cerebras) without routing through any external proxy.

### Free API Keys

- **Google Gemini:** [Get your key](https://aistudio.google.com/app/apikey)
- **Cerebras:** [Sign up for an API key](https://cloud.cerebras.ai/platform/)
- **Groq:** [Request a key](https://console.groq.com/keys)

### Paid API Keys

- **OpenAI:** [Get your key](https://platform.openai.com/api-keys)
- **Anthropic:** [Sign up for an API key](https://console.anthropic.com/settings/keys)

### Free and Paid API Keys
- **Cohere** [Get your key](https://dashboard.cohere.com/api-keys)

## Special Commands
Use special commands to perform an action quickly and easily.
### Translation
**Translate:** Translate text with ease using special command.
- To translate "Hello everyone!" into Spanish, use: `translate:spanish Hello everyone!` or its short form `t:spanish Hello everyone!`.
- AI will automatically detect the source language, requiring only the target language specification.
### Retrieval-Augmented Generation (RAG)
Search: Perform quick searches and retrieve relevant information with ease from Google.
- Example: `search: What is the latest news?` or `s: What is the latest news?`

# Google CSE API Key
To search using Google, you will need Google CSE (Custom Search Engine) API Key and CX.
- First, create a custom search here [Google CSE Panel](https://programmablesearchengine.google.com/controlpanel/all)
- Copy your CX ID
- Go to [Google Developers](https://developers.google.com/custom-search/v1/introduction) and click on *Get a Key* to get your API Key
- Now just enter CX and API key in Orion. for that go to Options -> More Options and that's it, it's time to chat.
- *Note: Google Search will return only snippets of search results, which can often provide enough context for AI, 
  but not in-depth information. Keep this in mind when using this tool.

## Awesome Prompts
150+ awesome prompts from [🧠 Awesome ChatGPT Prompts](https://github.com/f/awesome-chatgpt-prompts) to select with one click.
